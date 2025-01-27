import React from 'react';
import { BottomSheet } from '../src/BottomSheet';
import { boolean, number, object } from '@storybook/addon-knobs';
import { addParameters } from '@storybook/react';
import backgroundImage from './static/buildings.jpg';

addParameters({
  docs: {
    prepareForInline: StoryFn => (
      <div style={{ height: '100vh' }}>
        {' '}
        <StoryFn />
      </div>
    ),
  },
});

export default {
  title: 'BottomSheet',
  component: BottomSheet,
  decorators: [
    StoryFn => (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <StoryFn />
      </div>
    ),
  ],
};

export const AllPropsAsKnobs = () => (
  <BottomSheet
    backdrop={boolean('backdrop', true)}
    defaultHeight={number('defaultHeight', 100)}
    hidden={boolean('hidden', false)}
    fullHeight={boolean('fullHeight', true)}
    peekHeights={object('peekHeights', [250, 400])}
    threshold={number('threshold', 70)}
  >
    <div style={{ height: 900, padding: 24 }}>Content</div>
  </BottomSheet>
);
export const CustomStyles = () => (
  <div style={{ background: '#1E2128', color: '#F3EFF5' }}>
    Regular page content
    <BottomSheet
      peekHeights={[100, 300]}
      fullHeight={false}
      background={
        <div style={{ padding: 24 }}>
          Add images, carousels, or anything in here!
        </div>
      }
      styles={object('styles', {
        root: {
          borderRadius: '10px 10px 0 0',
          backgroundColor: '#313642',
          color: '#F3EFF5',
        },
        backdrop: {
          backgroundColor: 'rgba(255,255,255,0.8)',
        },
        background: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          paddingBottom: 24,
          display: 'flex',
          alignItems: 'flex-end',
          color: '#fff',
          fontSize: 24,
          fontWeight: 'bold',
        },
      })}
    >
      <div style={{ height: 900, padding: 24 }}>
        Pull me up for a pretty image.
      </div>
    </BottomSheet>
  </div>
);

CustomStyles.story = {
  decorators: [
    StoryFn => (
      <div
        style={{
          fontFamily: 'sans-serif',
          padding: 24,
          background: '#1E2128',
          color: '#F3EFF5',
        }}
      >
        <StoryFn />
      </div>
    ),
  ],
};

export const WithLongContentAndBackground = () => (
  <>
    Your regular page here.
    <BottomSheet
      background={
        <div style={{ backgroundColor: '#eee', height: '100%', padding: 24 }}>
          Add images, carousels, or anything in here!
        </div>
      }
      peekHeights={[250, 400]}
      styles={{
        root: {
          borderRadius: '10px 10px 0 0',
        },
      }}
    >
      <div style={{ height: 250, width: '100%', padding: 24 }}>
        Main bottom sheet content can go here.
      </div>
      <div
        style={{ height: 250, width: '100%', padding: 24, background: '#eee' }}
      >
        Peek heights reveal more information progressively.
      </div>
      <div
        style={{ height: 250, width: '100%', padding: 24, background: '#ccc' }}
      >
        Only scroll when you're at full height.
      </div>
    </BottomSheet>
  </>
);

export const ControlledModel = () => {
  const [index, set] = React.useState<number | undefined>(2);
  return (
    <>
      <div>
        <p>Current index: {index}</p>
        <button onClick={() => set(0)}>Close</button>
        <br />
        <button onClick={() => set(1)}>Peek height 250</button>
        <br />
        <button onClick={() => set(2)}>Peek height 400</button>
        <br />
        <button onClick={() => set(3)}>Full height</button>
        <br />
      </div>
      <BottomSheet
        currentIndex={index}
        onIndexChange={set}
        peekHeights={[250, 400]}
        backdrop={false}
        children={
          <div style={{ height: 900, padding: 24, position: 'relative' }}>
            Sheet content
            <button onClick={() => set(0)}>Close</button>
          </div>
        }
      />
    </>
  );
};
