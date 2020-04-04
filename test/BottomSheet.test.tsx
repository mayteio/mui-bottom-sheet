import React from 'react';
import { render, fireEvent, createEvent, wait } from '@testing-library/react';
import { Default as BottomSheet } from '../stories/BottomSheet.stories';
import { defaultBottomSheetOptions } from '../src/BottomSheet';

describe('<BottomSheet />', () => {
  const { getByText, debug } = render(
    <BottomSheet>
      <div style={{ height: 900 }}>sheet</div>
    </BottomSheet>
  );

  const sheet = getByText(/sheet/i);
  const element = sheet.parentNode;
  if (!element) throw Error('No parent node found');

  const closedHeight =
    window.innerHeight - defaultBottomSheetOptions.defaultHeight;

  it('renders in the correct starting position', async () => {
    await wait(() =>
      expect(element).toHaveStyle(`
        transform: translate3d(0,${closedHeight}px,0);
      `)
    );
  });

  it('should move when dragged', () => {
    console.log(window.innerHeight, sheet.offsetHeight);

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

    fireEvent(element, dragStart);
    fireEvent(element, dragEnd);

    expect(element).toHaveStyle(`
          transform: translate3d(0,${closedHeight - 200}px,0);
        `);
  });

  debug();
});
