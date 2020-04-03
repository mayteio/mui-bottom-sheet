import React, { PropsWithChildren } from 'react';
import { BottomSheet, BottomSheetProps } from '../src';
import { boolean } from '@storybook/addon-knobs';

export default {
  title: 'BottomSheet',
};

// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const Default = (
  props?: Partial<PropsWithChildren<BottomSheetProps>>
) => (
  <BottomSheet peekHeights={[250]} hidden={boolean('hidden', false)} {...props}>
    <div style={{ height: 900 }}>el</div>
  </BottomSheet>
);
