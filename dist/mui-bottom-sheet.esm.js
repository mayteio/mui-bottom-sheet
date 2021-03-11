import React, { useRef, useEffect } from 'react';
import { config, useSpring, a } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { ResizeObserver } from '@juggle/resize-observer';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/**
 * Find the closest value in an array to a given value
 * @param goal target value
 * @param numbers array of numbers to search through
 */
var closest = function closest(goal, numbers) {
  return numbers.reduce(function (prev, pos) {
    return Math.abs(pos - goal) < Math.abs(prev - goal) ? pos : prev;
  });
};

/** Some sensible defaults */

var defaultOptions = {
  backdrop: true,
  background: null,
  defaultHeight: 100,
  fullHeight: true,
  hidden: false,
  peekHeights: [],
  springConfig: config.stiff,
  styles: {
    root: {},
    backdrop: {},
    background: {}
  },
  threshold: 70
};
var BottomSheet = function BottomSheet(props) {
  /** Merge defaults and provided options */
  var _defaultOptions$props = _extends({}, defaultOptions, {}, props),
      backdrop = _defaultOptions$props.backdrop,
      background = _defaultOptions$props.background,
      currentIndex = _defaultOptions$props.currentIndex,
      defaultHeight = _defaultOptions$props.defaultHeight,
      fullHeight = _defaultOptions$props.fullHeight,
      hidden = _defaultOptions$props.hidden,
      onIndexChange = _defaultOptions$props.onIndexChange,
      peekHeights = _defaultOptions$props.peekHeights,
      springConfig = _defaultOptions$props.springConfig,
      userStyles = _defaultOptions$props.styles,
      threshold = _defaultOptions$props.threshold;
  /** Generate stylesheet */


  var styles = {
    backdrop: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1198,
      backgroundColor: 'rgba(0,0,0,0.3)'
    },
    background: {
      position: 'fixed',
      zIndex: 1199,
      left: 0,
      top: 0,
      width: '100%'
    },
    root: {
      background: '#fff',
      boxShadow: '0 -10px 20px rgba(0,0,0,0.3)',
      width: '100%',
      minHeight: defaultHeight,
      maxHeight: '100%',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1200
    }
  };
  /** generate stop position relative to window height */

  var stopPosition = function stopPosition(relativeHeight) {
    return window.innerHeight - relativeHeight;
  };
  /** Create array of possible stop positions */


  var defaultPosition = stopPosition(defaultHeight);
  var stops = [defaultPosition];
  /** Track heights */

  var _useMeasure = useMeasure({
    polyfill: ResizeObserver
  }),
      measureRef = _useMeasure[0],
      height = _useMeasure[1].height;

  var max = 0;
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


  peekHeights === null || peekHeights === void 0 ? void 0 : peekHeights.sort().forEach(function (peekHeight) {
    if (peekHeight < height && peekHeight < window.innerHeight) {
      stops.push(stopPosition(peekHeight));
    }
  });
  /** Track container scroll to prevent pulling when not at scrollTop */

  var containerRef = useRef(null);
  /** Track animateable styles */

  var _useSpring = useSpring(function () {
    return {
      y: defaultPosition
    };
  }),
      y = _useSpring[0].y,
      set = _useSpring[1];
  /** Handle draging */


  var bind = useDrag(function (_ref) {
    var _containerRef$current;

    var last = _ref.last,
        cancel = _ref.cancel,
        _ref$movement = _ref.movement,
        my = _ref$movement[1],
        _ref$direction = _ref.direction,
        dx = _ref$direction[0];

    /** If the drag is feeling more horizontal than vertical, cancel */
    if (dx < -0.8 || dx > 0.8) {
      cancel && cancel();
    }
    /** Prevent drag if container isn't at top of scroll */


    if (containerRef === null || containerRef === void 0 ? void 0 : (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.scrollTop) {
      return;
    }
    /**
     * Cancel the drag if we either hit the top of the screen
     * or a certain threshold above the max height (Defaults to 70px)
     */


    if (my < 0 || my < Math.min.apply(Math, stops) - threshold) {
      cancel && cancel();
    }
    /** On release, snap to closest stop position */


    if (last) {
      var lastPosition = closest(my, stops);
      set({
        y: lastPosition,
        config: springConfig
      });
      /** Call onIndexChange if it's set */

      onIndexChange && onIndexChange(stops.findIndex(function (stop) {
        return stop === lastPosition;
      }));
      return;
    }
    /** On each frame, set the y position */


    set({
      y: my,
      config: {
        duration: 0
      }
    });
  }, {
    /**
     * If the container has been scrolled, we want the sheet
     * to begin pulling down once the users gets back to the
     * top of the scroll. initialising the my position as the
     * negative value of the current scroll sets it to zero
     * when the user gets to the top of the scrollable area.
     */
    initial: function initial() {
      var _containerRef$current2;

      return [0, ((_containerRef$current2 = containerRef.current) === null || _containerRef$current2 === void 0 ? void 0 : _containerRef$current2.scrollTop) ? -containerRef.current.scrollTop + Math.min.apply(Math, stops) : y.goal];
    },
    bounds: {
      top: 0
    }
  });
  /** If the hidden prop is true, hide the entire sheet off-screen */

  useEffect(function () {
    set({
      y: hidden ? window.innerHeight + 30 : defaultPosition,
      config: config.gentle
    });
  }, [hidden, set, defaultPosition]);
  /** Set display:none when the drawer is hidden. */

  var display = y.to(function (py) {
    return py < window.innerHeight + 30 ? 'block' : 'none';
  });
  /**
   * Lock the scroll of the bottom sheet while it hasn't been
   * pulled to its maximum possible height.
   */

  var overflowY = y.to(function (v) {
    return v > Math.min.apply(Math, stops) ? 'hidden' : 'scroll';
  });
  /** Aggregate main sheet props into an object for spreading */

  var sheetStyle = {
    y: y,
    display: display,
    overflowY: overflowY
  };
  /** Animated styles for the backdrop based off the y position */

  var backdropActiveAt = stops.sort().reverse().find(function (n) {
    return n !== defaultPosition && n < defaultPosition;
  });
  var backdropStyle = {
    /** backdrop should only begin to fade in after first stop */
    opacity: y.to([backdropActiveAt || 0, defaultPosition], [1, 0]),

    /** Set display none when backdrop isn't show so you can interact with the page */
    display: y.to(function (py) {
      return py < defaultPosition && backdrop ? 'block' : 'none';
    })
  };
  /**
   * Background is an image or carousel that slides up behind the main
   * bottom sheet, similar to the venue images on Google maps.
   */

  var backgroundStyle = {
    height: Math.min.apply(Math, stops.filter(function (n) {
      return n > 0;
    })),
    y: y.to([].concat(stops).reverse(), stops.map(function (_stop, i, arr) {
      return i === arr.length - 1 || i === arr.length - 2 ? window.innerHeight : 0;
    }), 'clamp')
  };
  /**
   * Handle controlled component changes
   */

  useEffect(function () {
    if (currentIndex !== undefined && y.goal !== stops[currentIndex]) {
      if (!stops[currentIndex]) {
        console.warn('No stop exists for the index you set.');
      }

      set({
        y: stops[currentIndex],
        config: springConfig
      });
    }
  }, [currentIndex, stops, set, y]);
  return React.createElement(React.Fragment, null, React.createElement(a.div, Object.assign({}, bind(), {
    ref: containerRef,
    style: _extends({}, styles.root, {}, userStyles.root, {
      y: y
    }, sheetStyle)
  }), React.createElement("div", {
    ref: measureRef
  }, props.children)), background && React.createElement(a.div, {
    style: _extends({}, styles.background, {}, userStyles.background, {}, backgroundStyle),
    className: "background"
  }, background), React.createElement(a.div, {
    style: _extends({}, styles.backdrop, {}, userStyles.backdrop, {}, backdropStyle)
  }));
};

export { BottomSheet, defaultOptions };
//# sourceMappingURL=mui-bottom-sheet.esm.js.map
