import React, { cloneElement, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TransitionProps } from 'react-transition-group/Transition';
import Portal, { PortalProps } from '@/components/portal/portal';
import { IProps, noop } from '@/interfaces';

export const css = `
.w-overlay {
    position: fixed;
    overflow: auto;
    top: 0;
    right: 0;
    left: 0;
    outline: 0;
    bottom: 0;
    z-index: 9990;
    -webkit-overflow-scrolling: touch;
    text-align: center;
    height: 100%;
    width: 100%;
    display: none;
}
.w-overlay.open {
    z-index: 9999;
}
.w-overlay-open {
    overflow: hidden;
}
.w-overlay-content {
    position: relative;
    outline: 0;
    display: inline-block;
    vertical-align: middle;
    text-align: left;
    margin: 20px 0;
    z-index: 20;
}
.w-overlay-inline {
    position: absolute;
    overflow: initial;
}
.w-overlay-inline .w-overlay-container {
    position: relative;
}
.w-overlay-inline .w-overlay-backdrop {
    position: absolute;
}
.w-overlay-container {
    position: absolute;
    overflow: auto;
    z-index: 99999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.w-overlay-container:before {
    content: ' ';
    display: inline-block;
    height: 100%;
    width: 1px;
    vertical-align: middle;
}
.w-overlay-backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 1;
    z-index: 20;
    background-color: rgba(16, 22, 26, 0.7);
    overflow: auto;
    user-select: none;
}
.w-overlay-enter .w-overlay-backdrop {
    opacity: 0;
}
.w-overlay-enter-active .w-overlay-backdrop {
    opacity: 1;
    transition: opacity 300ms ease-in;
}
.w-overlay-exit .w-overlay-backdrop {
    opacity: 1;
}
.w-overlay-exit-active .w-overlay-backdrop {
    opacity: 0;
    transition: opacity 300ms ease-in;
}
.w-overlay-enter .w-overlay-content {
    transform: scale(0.5);
    opacity: 0;
}
.w-overlay-enter-active .w-overlay-content {
    opacity: 1;
    transform: translate(0);
    transition: transform 300ms ease, opacity 300ms ease;
}
.w-overlay-exit .w-overlay-content {
    opacity: 1;
    transform: translate(0);
    transition: transform 300ms ease, opacity 300ms ease;
}
.w-overlay-exit-active .w-overlay-content {
    transform: scale(0.5);
    opacity: 0;
}
.w-overlay-enter,
.w-overlay-enter-done,
.w-overlay-exit {
    display: inherit;
}  
`

export interface OverlayProps extends IProps, Omit<TransitionProps, 'timeout'> {
    timeout?: TransitionProps['timeout'];
    isOpen?: boolean;
    usePortal?: boolean;
    maskClosable?: boolean;
    dialogProps?: React.HTMLProps<HTMLElement>;
    backdropProps?: React.HTMLProps<HTMLDivElement>;
    portalProps?: PortalProps;
    hasBackdrop?: boolean;
    unmountOnExit?: boolean;
    transitionName?: string;
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    onOpening?: (node: HTMLElement, isAppearing: boolean) => void;
    onOpened?: (node: HTMLElement, isAppearing: boolean) => void;
    onClosing?: (node: HTMLElement) => void;
    onClosed?: (node: HTMLElement | React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onClose?: (evn: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export default function OverlayComp(props: OverlayProps) {
    const {
      className,
      style,
      isOpen: _ = false,
      prefixCls = 'w-overlay',
      usePortal = true,
      maskClosable = true,
      backdropProps = {},
      portalProps = {},
      hasBackdrop = true,
      unmountOnExit = true, // 设置 true 销毁根节点
      timeout = 300,
      transitionName = 'w-overlay',
      onOpening = noop,
      onOpened = noop,
      onClosing = noop,
      onClosed = noop,
      onClose = noop,
      onEnter = noop,
      onExiting = noop,
      onEntering = noop,
      onEntered = noop,
      onExit = noop,
      children,
      dialogProps = {},
      ...otherProps
    } = props;
  
    const [isOpen, setIsOpen] = useState<boolean>();
    const [visible, setVisible] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    const overlay = useRef(null);
    useEffect(() => {
      if (isOpen !== props.isOpen && props.isOpen) {
        setVisible(true);
      }
      if (isOpen !== props.isOpen && !props.isOpen) {
        overlayWillClose();
        setIsOpen(false);
      }
    }, [props.isOpen]);
  
    useEffect(() => {
      if (visible) {
        overlayWillOpen();
        setIsOpen(true);
      }
    }, [visible]);
  
    const decoratedChild =
      typeof children === 'object' ? (
        cloneElement(children, {
          ...dialogProps,
          style: { ...children.props.style, ...dialogProps.style },
          className: [children.props.className, `${prefixCls}-content`].filter(Boolean).join(' ').trim(),
          tabIndex: 0,
        })
      ) : (
        <span {...dialogProps} className={`${prefixCls}-content`}>
          {children}
        </span>
      );
  
    function handleClosed(node: HTMLElement | React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      setVisible(false);
      onClosed && onClosed(node);
    }
  
    function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      if (e.target !== container.current && usePortal) {
        return;
      }
      if (maskClosable && hasBackdrop) {
        overlayWillClose();
        setIsOpen(false);
        onClose && onClose(e);
      }
      backdropProps && backdropProps.onMouseDown && backdropProps.onMouseDown(e);
    }
  
    function overlayWillOpen() {
      if (hasBackdrop && usePortal) {
        document.body.classList.add(`${prefixCls}-open`);
      }
    }
  
    function overlayWillClose() {
      if (hasBackdrop && usePortal) {
        document.body.classList.remove(`${prefixCls}-open`);
      }
    }
    const TransitionGroupComp = (
        
      <CSSTransition
        classNames={transitionName}
        unmountOnExit={unmountOnExit}
        timeout={timeout!}
        in={isOpen}
        onEnter={(isAppearing: boolean) => {
          onEnter(overlay.current!, isAppearing);
        }}
        onEntering={(isAppearing: boolean) => {
          onOpening(overlay.current!, isAppearing);
          onEntering(overlay.current!);
        }}
        onEntered={(isAppearing: boolean) => {
          onOpened(overlay.current!, isAppearing);
          onEntered(overlay.current!);
        }}
        onExiting={() => {
          onClosing(overlay.current!);
          onExiting(overlay.current!);
        }}
        onExited={() => {
          handleClosed(overlay.current!);
          onExit(overlay.current!);
        }}
        nodeRef={overlay}
        {...otherProps}
      >
        {(status) => {
          return (     
            <>
            <style jsx>{css}</style>
           
            <div
              style={style}
              ref={overlay}
              className={[
                prefixCls,
                className,
                !usePortal ? `${prefixCls}-inline`  : null,
                isOpen ? `${prefixCls}-enter-done` : null,
              ]
                .filter(Boolean)
                .join(' ')
                .trim()}
            >
              {hasBackdrop &&
                cloneElement(<div />, {
                  ...backdropProps,
                  onMouseDown: handleBackdropMouseDown,
                  className: [`${prefixCls}-backdrop`, backdropProps.className].filter(Boolean).join(' ').trim(),
                  tabIndex: maskClosable ? 0 : null,
                })}
              {usePortal ? (
                <div ref={container} onMouseDown={handleBackdropMouseDown} className={`${prefixCls}-container`}>
                  {cloneElement(decoratedChild, { 'data-status': status })}
                </div>
              ) : (
                cloneElement(decoratedChild, { 'data-status': status })
              )}
            </div>
            </>
          );
        }}
      </CSSTransition>

    );
    if (visible && usePortal) {
        return (
            <>
                <Portal {...{ ...portalProps }}>{TransitionGroupComp}</Portal>
            </>
        );
    } else {
      return (
        <>
        <style jsx>{css}</style>
        {TransitionGroupComp}
        </>
      );
    }
}

