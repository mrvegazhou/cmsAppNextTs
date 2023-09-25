import {
  type ReactNode,
} from 'react';

export interface IOffcanvasProps {
    title?: string;
    header?: ReactNode;
    headerTitle?: ReactNode;
    content?: ReactNode;
    customContent?: ReactNode;
    isShowHeader?: boolean;
    isShowHeaderTitle?: boolean;
    isShowContent?: boolean;
    isStatic?: boolean;
    bodyScroll?: boolean;
    backdrop?: boolean;
    offcanvasClass?: string;
    offcanvasBodyClass?: string;
    offcanvasStyle?: Record<string, any>;
    start?: boolean;
    end?: boolean;
    top?: boolean;
    bottom?: boolean;
    keyboard?: boolean;
    scroll?: boolean;
    onShown?: () => void | Promise<void>;
    onHidden?: () => void | Promise<void>;
}
  
export interface IOffcanvasPropsSuper extends IOffcanvasProps {
    id: string;
    isShow: boolean;
}
  
export interface IOffcanvasPropsContainer {
    items: IOffcanvasPropsSuper[];
}