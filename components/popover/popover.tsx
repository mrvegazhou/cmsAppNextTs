import React, { useState } from 'react';
import OverLayTriggerComp, { OverlayTriggerProps } from '../overlay/overlayTrigger';
import './popover.css';

interface Confirm {
    trigger?: PopoverProps['trigger'];
    placement?: PopoverProps['placement'];
    children?: React.ReactNode;
    visibleArrow?: PopoverProps['visibleArrow'];
    onConfirm?: () => void;
    confirmText?: string;
    title?: React.ReactNode;
    cancelText?: string;
    id:string;
}
  
export function ConfirmComp(props: Confirm) {
    const {
      trigger = 'click',
      placement = 'top',
      confirmText = 'Yes',
      title,
      cancelText = 'No',
      visibleArrow,
      children,
      onConfirm,
    } = props;
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <PopoverComp
                isOpen={isOpen}
                visibleArrow={visibleArrow}
                content={
                <div style={{ padding: '12px 16px', position: 'relative' }}>
                    <i className="iconfont icon-information" 
                        style={{ position: 'absolute', top: 13.5, fontSize: 14, transform: 'rotate(180deg)', color: '#faad14' }}>
                    </i>
                    <div style={{ paddingLeft: 20 }}>
                    <div style={{ fontSize: 14 }}>{title}</div>
                    <div style={{ position: 'relative', bottom: 0, marginTop: 12, display: 'flex', justifyContent: 'end' }}>
                        <div onClick={() => setIsOpen(false)}>
                            {cancelText}
                        </div>
                        <div
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                                onConfirm?.();
                                setIsOpen(false);
                                console.log(isOpen)
                            }}
                        >
                            {confirmText}
                        </div>
                    </div>
                    </div>
                </div>
                }
                trigger={trigger}
                placement={placement}
            >
                <div onClick={() => setIsOpen(true)}>{children}</div>
            </PopoverComp>
        </>
    );
}

export interface PopoverProps extends OverlayTriggerProps {
  content?: React.ReactNode;
  visibleArrow?: boolean;
}

export default class PopoverComp extends React.Component<PopoverProps> {
  static Confirm = ConfirmComp;
  public static defaultProps: PopoverProps = {
    prefixCls: 'w-popover',
    placement: 'top',
    usePortal: true,
    isOpen: false,
    visibleArrow: true,
  };
  renderArrow = () => {
    const { prefixCls } = this.props;
    return (
      <div className={`${prefixCls}-arrow`}>
        <svg viewBox="0 0 30 30">
          <path
            fillOpacity="0.2"
            d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"
          />
          <path
            fill="#fff"
            d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"
          />
        </svg>
      </div>
    );
  };
  render() {
    const { prefixCls, className, content, visibleArrow, ...other } = this.props;
    const cls = [prefixCls, className, !visibleArrow ? 'no-arrow' : null].filter(Boolean).join(' ').trim();
    return (
      <OverLayTriggerComp
        {...other}
        overlay={
          <div className={cls}>
            {visibleArrow && this.renderArrow()}
            <div className={`${prefixCls}-inner`}>{this.props.content}</div>
          </div>
        }
      >
        {typeof this.props.children === 'object' && (this.props.children as JSX.Element).type.name !== 'Icon' ? (
          this.props.children
        ) : (
          <span style={{ display: 'block', writingMode: 'vertical-rl' }}>{this.props.children}</span>
        )}
      </OverLayTriggerComp>
    );
  }
}