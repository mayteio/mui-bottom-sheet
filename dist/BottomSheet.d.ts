import { FC, ReactElement } from 'react';
export interface bottomSheetOptions {
    /**
     * Show backdrop that darkens as the sheet is pulled up. Defaults to true.
     *
     * @default true
     */
    backdrop?: boolean;
    /**
     * Background component behind sheet. Requires at least two `peekHeights`.
     * @default null
     */
    background?: ReactElement;
    /**
     * Current peek index if you want to control the component.
     * @default 0;
     */
    currentIndex?: number;
    /**
     * Sheet height when in closed state.
     * @default 100
     */
    defaultHeight: number;
    /**
     * Whether to go allow sheet to go full screen. If false, sheet will max out at largest peekHeight.
     * @default true
     */
    fullHeight: boolean;
    /**
     * Completely hides the sheet when true.
     * @default false
     */
    hidden: boolean | number;
    /**
     * Called when the user interacts and moves the bottomsheet to a new peek height
     */
    onIndexChange?: (index: number) => void;
    /**
     * Sheet will stop at certain heights to reveal more info.
     * @default []
     */
    peekHeights?: number[];
    /**
     * Which spring config to use for snapping the sheet
     * @default config.stiff
     */
    springConfig: Record<string, any>;
    /**
     * User styles for root, background and backdrop.
     * @default {root:{},background:{},backdrop:{}}
     */
    styles?: bottomSheetStyles;
    /**
     * Threshold for over-dragging the sheet before snapping to closest height.
     * @default 70
     */
    threshold: number;
}
export interface BottomSheetProps extends Partial<bottomSheetOptions> {
}
export interface bottomSheetStyles {
    backdrop?: Record<string, any>;
    background?: Record<string, any>;
    root?: Record<string, any>;
}
/** Some sensible defaults */
export declare const defaultOptions: {
    backdrop: boolean;
    background: null;
    defaultHeight: number;
    fullHeight: boolean;
    hidden: boolean;
    peekHeights: never[];
    springConfig: {
        readonly tension: 210;
        readonly friction: 20;
    };
    styles: {
        root: {};
        backdrop: {};
        background: {};
    };
    threshold: number;
};
export declare const BottomSheet: FC<BottomSheetProps>;
