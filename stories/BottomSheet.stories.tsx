import React, { PropsWithChildren } from 'react';
import { BottomSheet, BottomSheetProps } from '../src';
import { boolean, number, object } from '@storybook/addon-knobs';

export default {
  title: 'BottomSheet',
};
// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const Default = (
  props?: Partial<PropsWithChildren<BottomSheetProps>>
) => (
  <BottomSheet
    children={<div style={{ height: number('child height', 900) }}>el</div>}
    hidden={boolean('hidden', false)}
    defaultHeight={number('defaultHeight', 100)}
    fullHeight={boolean('fullHeight', true)}
    peekHeights={object('peekHeights', [250, 500])}
    threshold={number('threshold', 70)}
    {...props}
  />
);

Default.story = {
  name: 'Default with knobs',
};

export const CustomStyles = () => (
  <BottomSheet
    styles={object('styles', {
      root: { borderRadius: 10, boxShadow: '0 -4px 4px rgba(0,0,0,0.1)' },
      backdrop: { backgroundColor: 'rgba(255,0,255,0.2)' },
    })}
  >
    <div style={{ height: 300, padding: 24, fontFamily: 'sans-serif' }}>el</div>
  </BottomSheet>
);

export const PeekHeights = () => (
  <BottomSheet peekHeights={[250, 500]}>
    <div
      style={{
        height: 250,
        backgroundColor: '#eee',
        padding: 24,
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      250px: Peek heights allow you to have positional stops during the swipe
      up.
    </div>
    <div
      style={{
        height: 250,
        backgroundColor: '#ddd',
        padding: 24,
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      500px: Use them to reveal more detailed information as it becomes
      relevant.
    </div>
    <div
      style={{
        height: 600,
        backgroundColor: '#ccc',
        padding: 24,
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      max: You can always have extended content that scrolls too.
    </div>
  </BottomSheet>
);
