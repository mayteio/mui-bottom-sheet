import React, { FC, ReactElement, useEffect, useRef } from 'react';
import { a, useSpring, config } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { ResizeObserver } from '@juggle/resize-observer';
import { closest } from './util';

export interface bottomSheetOptions {
  /**
   * Show backdrop that darkens as the sheet is pulled up. Defaults to true.
   *
   * @default true
   */
  backdrop?: boolean;

  /**
   * Background component behind sheet. Requires at least two `peekHeights`.
   * @default null
   */
  background?: ReactElement;

  /**
   * Current peek index if you want to control the component.
   * @default 0;
   */
  currentIndex?: number;

  /**
   * Sheet height when in closed state.
   * @default 100
   */
  defaultHeight: number;

  /**
   * Whether to go allow sheet to go full screen. If false, sheet will max out at largest peekHeight.
   * @default true
   */
  fullHeight: boolean;

  /**
   * Completely hides the sheet when true.
   * @default false
   */
  hidden: boolean | number;

  /**
   * Called when the user interacts and moves the bottomsheet to a new peek height
   */
  onIndexChange?: (index: number) => void;

  /**
   * Sheet will stop at certain heights to reveal more info.
   * @default []
   */
  peekHeights?: number[];

  /**
   * Which spring config to use for snapping the sheet
   * @default config.stiff
   */
  springConfig: Record<string, any>;

  /**
   * User styles for root, background and backdrop.
   * @default {root:{},background:{},backdrop:{}}
   */
  styles?: bottomSheetStyles;

  /**
   * Threshold for over-dragging the sheet before snapping to closest height.
   * @default 70
   */
  threshold: number;
}

export interface BottomSheetProps extends Partial<bottomSheetOptions> {}

export interface bottomSheetStyles {
  backdrop?: Record<string, any>;
  background?: Record<string, any>;
  root?: Record<string, any>;
}

/** Some sensible defaults */
export const defaultOptions = {
  backdrop: true,
  background: null,
  defaultHeight: 100,
  fullHeight: true,
  hidden: false,
  peekHeights: [],
  springConfig: config.stiff,
  styles: { root: {}, backdrop: {}, background: {} },
  threshold: 70,
};

export const BottomSheet: FC<BottomSheetProps> = props => {
  /** Merge defaults and provided options */
  const {
    backdrop,
    background,
    currentIndex,
    defaultHeight,
    fullHeight,
    hidden,
    onIndexChange,
    peekHeights,
    springConfig,
    styles: userStyles,
    threshold,
  } = {
    ...defaultOptions,
    ...props,
  };

  /** Generate stylesheet */
  const styles: bottomSheetStyles = {
    backdrop: {
      position: 'fixed' as React.CSSProperties['position'],
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1198,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    background: {
      position: 'fixed' as React.CSSProperties['position'],
      zIndex: 1199,
      left: 0,
      top: 0,
      width: '100%',
    },
    root: {
      background: '#fff',
      boxShadow: '0 -10px 20px rgba(0,0,0,0.3)',
      width: '100%',
      minHeight: defaultHeight,
      maxHeight: '100%',
      position: 'fixed' as React.CSSProperties['position'],
      left: 0,
      top: 0,
      zIndex: 1200,
    },
  };

  /** generate stop position relative to window height */
  const stopPosition = (relativeHeight: number) =>
    window.innerHeight - relativeHeight;

  /** Create array of possible stop positions */
  const defaultPosition = stopPosition(defaultHeight);
  const stops = [defaultPosition];

  /** Track heights */
  const [measureRef, { height }] = useMeasure({ polyfill: ResizeObserver });

  let max = 0;
  /** If it's taller than the window, clamp the stops at full screen */
  if (height > window.innerHeight && fullHeight) {
    stops.push(0);
  }

  /** If the el is smaller than the window and larger than the default, add it as a stop. */
  if (height < window.innerHeight && height > defaultHeight) {
    max = stopPosition(height);
    stops.push(max);
  }

  /** Add peek heights if they are less than the max height */
  peekHeights?.sort().forEach(peekHeight => {
    if (peekHeight < height && peekHeight < window.innerHeight) {
      stops.push(stopPosition(peekHeight));
    }
  });

  /** Track container scroll to prevent pulling when not at scrollTop */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** Track animateable styles */
  const [{ y }, set] = useSpring(() => ({
    y: defaultPosition,
  }));

  /** Handle draging */
  const bind = useDrag(
    ({ last, cancel, movement: [, my], direction: [dx] }) => {
      /** If the drag is feeling more horizontal than vertical, cancel */
      if (dx < -0.8 || dx > 0.8) {
        cancel && cancel();
      }

      /** Prevent drag if container isn't at top of scroll */
      if (containerRef?.current?.scrollTop) {
        return;
      }

      /**
       * Cancel the drag if we either hit the top of the screen
       * or a certain threshold above the max height (Defaults to 70px)
       */
      if (my < 0 || my < Math.min(...stops) - threshold) {
        cancel && cancel();
      }

      /** On release, snap to closest stop position */
      if (last) {
        const lastPosition = closest(my, stops);
        set({
          y: lastPosition,
          config: springConfig,
        });

        /** Call onIndexChange if it's set */
        onIndexChange &&
          onIndexChange(stops.findIndex(stop => stop === lastPosition));
        return;
      }

      /** On each frame, set the y position */
      set({
        y: my,
        config: { duration: 0 },
      });
    },
    {
      /**
       * If the container has been scrolled, we want the sheet
       * to begin pulling down once the users gets back to the
       * top of the scroll. initialising the my position as the
       * negative value of the current scroll sets it to zero
       * when the user gets to the top of the scrollable area.
       */
      initial: () => [
        0,
        containerRef.current?.scrollTop
          ? -containerRef.current.scrollTop + Math.min(...stops)
          : y.goal,
      ],
      bounds: { top: 0 },
    }
  );

  /** If the hidden prop is true, hide the entire sheet off-screen */
  useEffect(() => {
    set({
      y: hidden ? window.innerHeight + 30 : defaultPosition,
      config: config.gentle,
    });
  }, [hidden, set, defaultPosition]);

  /** Set display:none when the drawer is hidden. */
  const display = y.to(py => (py < window.innerHeight + 30 ? 'block' : 'none'));

  /**
   * Lock the scroll of the bottom sheet while it hasn't been
   * pulled to its maximum possible height.
   */
  const overflowY = y.to(v => (v > Math.min(...stops) ? 'hidden' : 'scroll'));

  /** Aggregate main sheet props into an object for spreading */
  const sheetStyle = {
    y,
    display,
    overflowY,
  };

  /** Animated styles for the backdrop based off the y position */
  const backdropActiveAt = stops
    .sort()
    .reverse()
    .find(n => n !== defaultPosition && n < defaultPosition);

  const backdropStyle = {
    /** backdrop should only begin to fade in after first stop */
    opacity: y.to([(backdropActiveAt as number) || 0, defaultPosition], [1, 0]),
    /** Set display none when backdrop isn't show so you can interact with the page */
    display: y.to(py => (py < defaultPosition && backdrop ? 'block' : 'none')),
  };

  /**
   * Background is an image or carousel that slides up behind the main
   * bottom sheet, similar to the venue images on Google maps.
   */
  const backgroundStyle = {
    height: Math.min(...stops.filter(n => n > 0)),
    y: y.to(
      [...stops].reverse(),
      stops.map((_stop, i, arr) =>
        i === arr.length - 1 || i === arr.length - 2 ? window.innerHeight : 0
      ),
      'clamp'
    ),
  };

  /**
   * Handle controlled component changes
   */
  useEffect(() => {
    if (currentIndex !== undefined && y.goal !== stops[currentIndex]) {
      if (!stops[currentIndex]) {
        console.warn('No stop exists for the index you set.');
      }
      set({
        y: stops[currentIndex],
        config: springConfig,
      });
    }
  }, [currentIndex, stops, set, y]);

  return (
    <>
      <a.div
        {...bind()}
        ref={containerRef}
        style={{ ...styles.root, ...userStyles.root, y, ...sheetStyle }}
      >
        <div ref={measureRef}>{props.children}</div>
      </a.div>
      {background && (
        <a.div
          style={{
            ...styles.background,
            ...userStyles.background,
            ...backgroundStyle,
          }}
          className="background"
        >
          {background}
        </a.div>
      )}
      <a.div
        style={{ ...styles.backdrop, ...userStyles.backdrop, ...backdropStyle }}
      />
    </>
  );
};
