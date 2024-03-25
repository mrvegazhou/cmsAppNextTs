import {
  type MouseEvent,
  type ReactNode,
} from 'react';

export interface IModalProps {
    mid?: string;
    title?: string;
    header?: ReactNode;
    footer?: ReactNode;
    content?: ReactNode;
    customContent?: ReactNode;
    onConfirm?: (e?: MouseEvent<HTMLButtonElement>) => void;
    isShowHeader?: boolean;
    isShowFooter?: boolean;
    isShowContent?: boolean;
    isStatic?: boolean;
    keyboard?: boolean;
    scrollable?: boolean;
    centered?: boolean;
    small?: boolean;
    large?: boolean;
    extraLarge?: boolean;
    fullscreen?: boolean;
    fullscreenClass?: string;
    focus?: boolean;
    backdrop?: boolean;
    onShown?: () => void | Promise<void>;
    onHidden?: () => void | Promise<void>;
  }