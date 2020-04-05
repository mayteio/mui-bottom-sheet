import React, { useEffect, useRef } from 'react';
import { a, config, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { ResizeObserver } from '@juggle/resize-observer';
import { closest } from './util';

export interface bottomSheetOptions {
  /** Backdrop that slides up relative to current swiped height. Defaults to nothing. */
  backdrop?: React.ReactElement;
  /** Root component */
  component?: string | React.Component;
  /** Sheet height when in closed state. Defaults to 100px. */
  defaultHeight: number;
  /** Whether to go to full screen height. defaults to false. */
  fullHeight: boolean;
  /** Completely hides the sheet when true */
  hidden: boolean | number;
  /** Sheet will stop at certain heights to reveal more info. Defaults to []. */
  peekHeights?: number[];
  /** User styles for root and backdrop */
  styles?: bottomSheetStyles;
  /** Threshold for over-dragging. Defaults to 70. */
  threshold: number;
}

export interface BottomSheetProps extends Partial<bottomSheetOptions> {}

export interface bottomSheetStyles {
  backdrop?: Record<string, any>;
  root?: Record<string, any>;
}

const HIDDEN_THRESHOLD = 30;

export const defaultBottomSheetOptions = {
  defaultHeight: 100,
  fullHeight: false,
  hidden: false,
  threshold: 70,
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  styles: userStyles = { root: {}, backdrop: {} },
  ...props
}) => {
  /** measure the component height for clamping */
  const [ref, { height }] = useMeasure({ polyfill: ResizeObserver });

  /** Default options, assumes a threshold of 70 */
  const optionDefaults: bottomSheetOptions = {
    ...defaultBottomSheetOptions,
    defaultHeight: height - 70 > 100 ? 100 : height,
  };

  /** Build options with defaults */
  const options = {
    ...optionDefaults,
    ...props,
  };

  /** Could move this to a function */
  const styles = {
    backdrop: {
      position: 'fixed' as React.CSSProperties['position'],
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1199,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    root: {
      position: 'fixed' as React.CSSProperties['position'],
      top: 0,
      left: 0,
      width: '100%',
      maxHeight: '100%',
      height: options.fullHeight ? '100%' : 'auto',
      backgroundColor: '#fff',
      zIndex: 1200,
      overflow: 'scroll',
      boxShadow: '0 -10px 20px rgba(0,0,0,0.2)',
      /** The dag */
      paddingBottom: props.threshold,
    },
  };

  /** Store translateY state with react-spring */
  const start = window.innerHeight - options.defaultHeight;
  const [{ y }, set] = useSpring(() => ({
    y: start,
    opacity: 0,
  }));

  /** Create position stop array */
  const positions = [window.innerHeight - options.defaultHeight];
  if (options.peekHeights)
    positions.push(...options.peekHeights.map(h => window.innerHeight - h));
  if (options.fullHeight) positions.push(0);

  /**
   * Two problems here
   * 1. if fullHeight = false and the child has a height greater than the max position, it should stop at the max position and allow scroll
   * 2. peek heights are not allowing touch scroll when at full height (window.innherHeight)
   *
   * Consider re-writing and figuring out tests?
   */

  /** The extra options.threshold is for the dag - ensuring we don't overpull the sheet */
  const maxHeight =
    window.innerHeight > height
      ? Math.abs(window.innerHeight - height + options.threshold)
      : 0;

  /** Only push maxHeight to the stack if it's a value */
  if (maxHeight < window.innerHeight) positions.push(maxHeight);

  /** Track dragging state so we can prevent scroll */
  const draggingRef = useRef(false);

  /**
   * Track container so we can scrollTop position and only
   * begin pulling the drawer down when we're completely scrolled.
   */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** Handle gesture */
  const bind = useDrag(
    ({ first, last, movement: [, my], cancel }) => {
      /**
       * Set dragging state on first and last frames.
       * Used in checking whether to allow scroll or not.
       */
      if (first) draggingRef.current = true;
      if (last) draggingRef.current = false;

      /**
       * Prevent the sheet from being pulled down if the
       * contents have been scroll down, until back to top.
       */
      if (containerRef?.current?.scrollTop !== 0) {
        return;
      }

      /**
       * Stop the user dragging further than they may. If the sheet is
       * bigger than the window, then this should be 0.
       */
      if (
        my > 0 &&
        my < maxHeight - (window.innerHeight > height ? options.threshold : 0)
      ) {
        cancel && cancel();
      }

      /** On release, clamp to closest position stop */
      if (last) {
        const finalPosition = closest(y.getValue(), positions);

        set({
          y: finalPosition < maxHeight ? maxHeight : finalPosition,
          config: config.stiff,
        });
        return;
      }

      /** Set position as the sheet is being dragged */
      set({
        y: my,
        immediate: false,
        config: { duration: 0 },
      });
    },
    {
      initial: () => [
        0,
        containerRef.current && containerRef.current.scrollTop !== 0
          ? -containerRef?.current?.scrollTop
          : y.getValue(),
      ],
      bounds: { top: 0 },
      rubberband: true,
    }
  );

  /** Prevent scroll while there is more to be swiped up */
  const touchAction = y.to(v => (v > 0 ? 'none' : 'auto'));

  const overflow = y.to(v => (v <= maxHeight ? 'scroll' : 'hidden'));

  /** If hidden is set to true, hide the whole thing, */
  useEffect(() => {
    set({
      y: options.hidden ? window.innerHeight + HIDDEN_THRESHOLD : start,
      config: config.gentle,
    });
  }, [options.hidden, set, start]);

  /** Set display:none when the drawer is hidden. */
  const display = y.to(py =>
    py < window.innerHeight + HIDDEN_THRESHOLD ? 'block' : 'none'
  );

  /** Show/hide background */
  const backdropActiveAt = positions
    .sort()
    .reverse()
    .find(n => n !== start && n < start);

  /** Animated styles for the backdrop based off the y position */
  const backdropStyle = {
    opacity: y.to([backdropActiveAt as number, start], [1, 0], 'clamp'),
    display: y.to(py => (py < window.innerHeight ? 'block' : 'none')),
  };

  console.log(touchAction.getValue(), overflow.getValue());

  return (
    <>
      <a.div
        style={{
          ...styles.backdrop,
          ...userStyles.backdrop,
          ...backdropStyle,
        }}
      />
      <a.div
        ref={containerRef}
        {...bind()}
        style={{
          ...styles.root,
          ...userStyles.root,
          y,
          display,
          touchAction,
          overflow,
        }}
      >
        <div ref={ref}>{children}</div>
      </a.div>
    </>
  );
};
