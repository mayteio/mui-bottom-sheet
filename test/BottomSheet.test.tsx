import React from 'react';
import { render } from '@testing-library/react';
import { Default as BottomSheet } from '../stories/BottomSheet.stories';

describe('<BottomSheet />', () => {
  it('renders without crashing and displays children', () => {
    const { getByText } = render(<BottomSheet>Look ma, bottom!</BottomSheet>);
    expect(getByText(/look ma/i)).toBeInTheDocument();
  });
});
