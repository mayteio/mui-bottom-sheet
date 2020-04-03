import React, { useEffect } from 'react';
import { a, useSpring, config } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { closest } from './util';

export interface bottomSheetOptions {
  /** Sheet height when in closed state. Defaults to 100px. */
  defaultHeight: number;
  /** Sheet will stop at certain heights to reveal more info. Defaults to none. */
  peekHeights?: number[];
  /** Backdrop that slides up relative to current swiped height. Defaults to nothing. */
  backdrop?: React.ReactElement;
  /** Root component */
  component?: string | React.Component;
  /** whether to completely hide it */
  hidden: boolean | number;
}

export interface BottomSheetProps extends Partial<bottomSheetOptions> {}

export const defaultBottomSheetOptions: bottomSheetOptions = {
  defaultHeight: 100,
  hidden: false,
};

const styles = {
  root: {
    position: 'fixed' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    width: '100%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    overflow: 'scroll',
    boxShadow: '0 -10px 20px rgba(0,0,0,0.2)',
  },
  backdrop: {
    position: 'fixed' as React.CSSProperties['position'],
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  ...props
}) => {
  /** Build options with defaults */
  const options = {
    ...defaultBottomSheetOptions,
    ...props,
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

  /** measure the component height for clamping */
  const [ref, { height }] = useMeasure();
  const maxHeight = Math.abs(window.innerHeight - height);
  positions.push(maxHeight);

  /** Handle gesture */
  const bind = useDrag(
    ({ last, movement: [, my], cancel }) => {
      /** Stop the user dragging further than they may */
      if (my < maxHeight - 70) {
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
        config: config.stiff,
      });
    },
    {
      initial: () => [0, y.getValue()],
      bounds: { top: 0 },
      rubberband: true,
    }
  );

  /** If hidden is set to true, hide the whole thing, */
  useEffect(() => {
    set({
      y: options.hidden ? window.innerHeight + 30 : start,
      config: config.gentle,
    });
  }, [options.hidden]);

  /** Set display:none when the drawer is hidden. */
  const display = y.to(py => (py < window.innerHeight + 30 ? 'block' : 'none'));

  /** Show/hide background */
  const backdropActiveAt =
    positions
      .sort()
      .reverse()
      .find(n => n !== start && n < start) || start;

  const backdropStyle = {
    opacity: y.to([backdropActiveAt, start], [1, 0], 'clamp'),
    display: y.to(py => (py < window.innerHeight ? 'block' : 'none')),
  };

  return (
    <>
      <a.div style={{ ...backdropStyle, ...styles.backdrop }} />
      <a.div ref={ref} {...bind()} style={{ y, display, ...styles.root }}>
        {children}
      </a.div>
    </>
  );
};
