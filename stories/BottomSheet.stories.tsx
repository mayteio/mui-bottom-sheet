import React, { PropsWithChildren } from 'react';
import { BottomSheet, BottomSheetProps } from '../src/BottomSheet';

export default {
  title: 'A BottomSheet',
  component: BottomSheet,
};

// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const Default = (
  props?: Partial<PropsWithChildren<BottomSheetProps>>
) => (
  <>
    can interact
    <BottomSheet
      {...props}
      background={<div style={{ backgroundColor: '#f00' }}>background</div>}
    >
      <div style={{ height: 900, width: 20, border: '2px dotted #aaa' }} />
    </BottomSheet>
  </>
);
