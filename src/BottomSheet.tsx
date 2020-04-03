import React from 'react';

export interface bottomSheetOptions {
  /** Sheet height when in closed state. Defaults to 100px. */
  defaultHeight?: number;
  /** Sheet will stop at certain heights to reveal more info. Defaults to none. */
  peekHeight?: number;
  /** Whether to continue to cover the entire screen. Defaults to true. Must provide a peekHeight if false. */
  fullHeight?: boolean;
  /** Backdrop that slides up relative to current swiped height. Defaults to nothing. */
  backdrop?: React.ReactElement;
  /** Root component */
  component?: string | React.Component;
}

export interface BottomSheetProps extends bottomSheetOptions {}

const defaultOptions: bottomSheetOptions = {
  defaultHeight: 100,
  fullHeight: true,
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  ...props
}) => {
  const options = {
    ...defaultOptions,
    ...props,
  };

  console.log(options);

  return <div>{children}</div>;
};
