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
  <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
    Map will go here
    <BottomSheet
      background={
        <div style={{ backgroundColor: '#eee', height: '100%', padding: 24 }}>
          Location image sliders can go here
        </div>
      }
      peekHeights={[250, 400]}
      {...props}
    >
      <div style={{ height: 900, width: '100%', padding: 24 }}>
        Waypoint information carousel here
      </div>
    </BottomSheet>
  </div>
);
