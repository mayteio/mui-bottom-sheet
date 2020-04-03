import React from 'react';
import { render, fireEvent, createEvent } from '@testing-library/react';
import { Default as BottomSheet } from '../stories/BottomSheet.stories';
import { defaultBottomSheetOptions } from '../src/BottomSheet';

describe('<BottomSheet />', () => {
  const { getByText } = render(<BottomSheet>sheet</BottomSheet>);

  const sheet = getByText(/sheet/i);
  const closedHeight =
    window.innerHeight - defaultBottomSheetOptions.defaultHeight;

  it('renders in the correct starting position', () => {
    expect(sheet).toHaveStyle(`
        transform: translate3d(0,${closedHeight}px,0);
      `);
  });

  it('should move when dragged', () => {
    const dragStart = createEvent.mouseDown(sheet, {
      clientX: 20,
      clientY: window.innerHeight - 1,
      buttons: 1,
    });

    const dragEnd = createEvent.mouseUp(sheet, {
      clientX: 20,
      clientY: window.innerHeight,
      buttons: 1,
    });

    fireEvent(sheet, dragStart);
    fireEvent(sheet, dragEnd);

    expect(sheet).toHaveStyle(`
          transform: translate3d(0,${closedHeight - 200}px,0);
        `);
  });
});
