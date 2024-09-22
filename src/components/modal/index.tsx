import React, { useState, useEffect } from 'react';
import Overlay, { OverlayProps } from '../overlay';
import { IProps, noop } from '@/interfaces';
import './style/index.css';
import CallShow from './CallShow';
import { PortalProps } from '../portal/portal';

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'link';
export interface ButtonProps extends IProps, React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | MouseEvent) => void;
}

export interface ModalProps extends IProps, OverlayProps {
  type?: ButtonType;
  cancelText?: string;
  confirmButtonProps?: Omit<ButtonProps, 'ref'>; // Omit 是：以一个类型为基础支持剔除某些属性，然后返回一个新类型。
  cancelButtonProps?: Omit<ButtonProps, 'ref'>;
  content?: React.ReactNode;
  confirmText?: string;
  title?: string;
  icon?: boolean;
  useButton?: boolean;
  usePortal?: boolean;
  autoFocus?: boolean;
  isCloseButtonShown?: boolean;
  isOpen?: boolean;
  bodyStyle?: React.CSSProperties;
  maxWidth?: number;
  minWidth?: number;
  width?: string;
  height?: string;
  onCancel?: (evn: React.MouseEvent<HTMLButtonElement> & MouseEvent) => void;
  onConfirm?: (evn: React.MouseEvent<HTMLButtonElement> & MouseEvent) => void;
  portalProps?: PortalProps;
}

const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<OverlayProps>> = React.forwardRef<
  OverlayProps,
  ModalProps
>((props, ref) => {
  const {
    prefixCls = 'w-modal',
    className,
    children,
    useButton = true,
    usePortal = true,
    autoFocus = false,
    isOpen: _ = false,
    title,
    cancelText,
    cancelButtonProps,
    confirmButtonProps,
    content,
    confirmText = '确认',
    type = 'light',
    icon = false,
    maxWidth = 500,
    minWidth = 320,
    width,
    height,
    isCloseButtonShown = true,
    onCancel = noop,
    onConfirm = noop,
    bodyStyle,
    ...other
  } = props;
  const [isOpen, setIsOpen] = useState(props.isOpen);
  useEffect(() => {
    if (props.isOpen !== isOpen) {
      setIsOpen(props.isOpen);
    }
  }, [props.isOpen]);

  const [loading, setLoading] = useState(false);
  const cls = [prefixCls, className, type ? `${type}` : null].filter(Boolean).join(' ').trim();
  function onClose() {
    setIsOpen(false);
  }
  async function handleCancel(e: React.MouseEvent<HTMLButtonElement, MouseEvent> | MouseEvent) {
    setLoading(true);
    try {
      // @ts-ignore
      onCancel && (await onCancel(e));
    } catch (e) { }
    setIsOpen(false);
    setLoading(false);
  }
  async function handleConfirm(e: React.MouseEvent | MouseEvent) {
    setLoading(true);
    try {
      // @ts-ignore
      onConfirm && (await onConfirm(e));
    } catch (e) { }
    setIsOpen(false);
    setLoading(false);
  }

  return (
    <Overlay usePortal={usePortal} isOpen={isOpen} {...other} onClose={onClose} className={cls}>
      <div className={`${prefixCls}-container`} id="w-modal" style={{height}}>
        <div
          className={[
            `${prefixCls}-inner`,
            title ? `${prefixCls}-shown-title` : null,
            icon ? `${prefixCls}-shown-icon` : null,
          ]
            .filter(Boolean)
            .join(' ')
            .trim()}
          style={{maxWidth, minWidth, width, height}}
        >
          {(title || icon) && (
            <div className={`${prefixCls}-header`}>
              {icon && <i className='w-icon iconfont icon-duihuakuang-xinxi fs-5' />}
              {title && <span>{title}</span>}
              {isCloseButtonShown && <button type="button" className="btn-close" aria-label="Close" onClick={(e) => handleCancel(e)}></button>}
            </div>
          )}
          <div className={`${prefixCls}-body`} style={bodyStyle}>
            {children || content}
          </div>
          {useButton && (
            <div className={`${prefixCls}-footer`}>
              <button
                autoFocus={autoFocus}
                type="button"
                disabled={loading}
                className={`btn btn-${type}`}
                {...confirmButtonProps}
                onClick={(e) => handleConfirm(e)}
              >
                {confirmText}
              </button>
              {cancelText && (
                <button {...cancelButtonProps} onClick={(e) => handleCancel(e)}>
                  {cancelText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
});
Modal.displayName = 'Modal';

type Modal = typeof Modal & {
  show: (props?: Omit<ModalProps, 'onClosed' | 'isOpen'> & { children?: React.ReactNode }) => void;
};
(Modal as Modal).show = CallShow;
export default Modal as Modal;