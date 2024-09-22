import { type ReactNode } from 'react';

export interface IToastProps {
    title?: string;
    header?: ReactNode;
    content?: ReactNode;
    customContent?: ReactNode;
    isShowHeader?: boolean;
    isShowContent?: boolean;
    toastClass?: string;
    containerStyle?: React.CSSProperties;
    animation?: boolean;
    autohide?: boolean;
    delay?: number;
    onShown?: () => void | Promise<void>;
    onHidden?: () => void | Promise<void>;
    type?:
      | 'error'
      | 'danger'
      | 'primary'
      | 'success'
      | 'warning'
      | 'secondary'
      | 'info'
      | 'light'
      | 'ERROR'
      | 'DANGER'
      | 'PRIMARY'
      | 'SUCCESS'
      | 'WARNING'
      | 'SECONDARY'
      | 'INFO'
      | 'LIGHT';
    message?: any;
}
  
export interface IToastPropsSuper extends IToastProps {
    id: string;
    isShow: boolean;
}
  
export interface IToastsProps {
    toasts: IToastPropsSuper[];
    toastContainerClass?: string;
    containerStyle?: React.CSSProperties;
}
  