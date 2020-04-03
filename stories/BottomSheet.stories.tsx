import React, { PropsWithChildren } from 'react';
import { BottomSheet, BottomSheetProps } from '../src';

export default {
  title: 'BottomSheet',
};

// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const Default = (
  props?: Partial<PropsWithChildren<BottomSheetProps>>
) => <BottomSheet {...props} />;
