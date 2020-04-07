import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Default as BottomSheet } from '../stories/ABottomSheet.stories';
import { defaultOptions } from '../src/BottomSheet2';

describe('<BottomSheet />', () => {
  // setup, put here so we re-use the element.
  const { getByText, debug, rerender } = render(<BottomSheet>el</BottomSheet>);
  const el = getByText('el');

  test('should render', () => {
    expect(el).toBeInTheDocument();
  });

  test('should resize to defaultHeight when children height is too short', () => {
    expect(el).toHaveStyle(`
    min-height: 100px
    `);
  });

  test('should position itself at the bottom of the screen', () => {
    expect(el).toHaveStyle(`
    transform: translate3d(0,${window.innerHeight -
      defaultOptions.defaultHeight}px,0)
      `);
  });

  test('should move and snap back to original position', () => {
    fireEvent.mouseDown(el, {
      clientX: 20,
      clientY: window.innerHeight - 50,
      buttons: 1,
    });

    fireEvent.mouseMove(window, {
      clientX: 20,
      clientY: window.innerHeight - 100,
      buttons: 1,
    });

    // moved
    expect(el).toHaveStyle(`
    transform: translate3d(0,${window.innerHeight -
      defaultOptions.defaultHeight -
      50}px,0)
      `);

    fireEvent.mouseUp(window, {
      clientX: 20,
      clientY: window.innerHeight - 100,
      buttons: 1,
    });

    expect(el).toHaveStyle(`
      transform: translate3d(0,${window.innerHeight -
        defaultOptions.defaultHeight}px,0)
        `);
  });

  test('should snap to max height if content is smaller than window height', () => {
    // rerender();
    // <BottomSheet>
    //   el <div style={{ height: 300 }} />
    // </BottomSheet>
    debug();
  });
});
