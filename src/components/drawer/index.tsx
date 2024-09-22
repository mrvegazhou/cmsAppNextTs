import React, { useMemo, useEffect, useState } from 'react';
import Overlay, { OverlayProps } from '../overlay';
import { HTMLDivProps } from '@/interfaces';
import './index.css';

export interface DrawerProps extends OverlayProps {
  footer?: React.ReactNode;
  icon?: string;
  title?: React.ReactNode;
  bodyProps?: HTMLDivProps;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  size?: number;
  hasOverLay?: boolean;
  isCloseButtonShown?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export default (props: DrawerProps = {}) => {
  const {
    prefixCls = 'w-drawer',
    hasOverLay = true,
    className,
    style,
    placement = 'right',
    size = 260,
    title,
    footer,
    icon,
    isCloseButtonShown = true,
    bodyProps,
    timeout = 300,
    isOpen = false,
    maskClosable = true,
    ...overlayProps
  } = props;
  const cls = [className, prefixCls, placement].filter(Boolean).join(' ').trim();
  const bodyCls = [bodyProps ? bodyProps.className : null, prefixCls ? `${prefixCls}-body-inner` : null]
    .filter(Boolean)
    .join(' ')
    .trim();
  const styl = {
    ...style,
    [/^(top|bottom)$/.test(placement!) ? 'height' : 'width']: size,
  };

  const footerView = useMemo(() => (footer ? <div className={`${prefixCls}-footer`}>{footer}</div> : null), [footer]);
  const iconView = useMemo(() => (icon ? <i className={`iconfont ${icon}`} /> : null), [icon]);
  const titleView = useMemo(() => (title ? <h6>{title}</h6> : null), [title]);
  const closeSvg = useMemo(() => <span className={`${prefixCls}-close-span`}><svg viewBox="0 0 20 20"><path d="M3.21878052,2.15447998 L9.99678993,8.92744993 L16.7026814,2.22182541 C17.1598053,1.8145752 17.6339389,2.05757141 17.8218994,2.2625885 C18.0098599,2.46760559 18.1171875,2.95117187 17.7781746,3.29731856 L11.0707899,10.0014499 L17.7781746,16.7026814 C18.0764771,16.9529419 18.0764771,17.4433594 17.8370056,17.7165527 C17.5975342,17.9897461 17.1575623,18.148407 16.7415466,17.8244324 L9.99678993,11.0754499 L3.24360657,17.8271179 C2.948349,18.0919647 2.46049253,18.038208 2.21878052,17.7746429 C1.9770685,17.5110779 1.8853302,17.0549164 2.19441469,16.7330362 L8.92278993,10.0014499 L2.22182541,3.29731856 C1.97729492,3.02648926 1.89189987,2.53264694 2.22182541,2.22182541 C2.55175094,1.91100387 3.04367065,1.95437622 3.21878052,2.15447998 Z" fillRule="evenodd"></path></svg></span>, [])
  return (
    <Overlay hasOverLay={hasOverLay} className={cls} timeout={timeout} isOpen={isOpen} maskClosable={maskClosable} {...overlayProps}>
      <div className={`${prefixCls}-wrapper`} style={styl}>
        {(title || icon) && (
          <div className={`${prefixCls}-header`}>
            {iconView}
            {titleView}
            {title && isCloseButtonShown && <button type="button" className={`${prefixCls}-btn`} onClick={props.onClose}>{closeSvg}</button>}
          </div>
        )}
        <div className={`${prefixCls}-body`}>
          <div {...bodyProps} className={bodyCls}>
            {props.children}
          </div>
        </div>
        {footerView}
      </div>
    </Overlay>
  );
};