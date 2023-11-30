import React, { useState, useEffect, useRef } from 'react';
import OverLayTriggerComp, { OverlayTriggerProps, cssOutput } from '../overlay/overlayTrigger';

const overlayTriggerCss = cssOutput();
const css = `
${overlayTriggerCss}

.w-popover {
    position: relative;
    display: inline-block;
    outline: 0;
}
.w-popover-arrow {
    position: absolute;
    width: 30px;
    height: 30px;
    border-color: transparent;
    z-index: 21;
}
.w-popover-inner {
    display: block;
    text-align: left;
    text-decoration: none;
    background-color: #fff;
    border-radius: 4px;
    min-height: 23px;
    box-shadow: rgba(16, 22, 26, 0.1) 0px 0px 0px 1px, rgba(16, 22, 26, 0.2) 0px 0px 1px, rgba(16, 22, 26, 0.2) 0px 0px 1px;
}
.w-popover.right .w-popover-arrow,
.w-popover.rightTop .w-popover-arrow,
.w-popover.rightBottom .w-popover-arrow {
    left: 2px;
    margin-top: -15px;
    top: 50%;
}
.w-popover.left .w-popover-arrow,
.w-popover.leftTop .w-popover-arrow,
.w-popover.leftBottom .w-popover-arrow {
    transform: rotate(180deg);
    margin-top: -15px;
    right: 2px;
    top: 50%;
}
.w-popover.leftTop .w-popover-arrow,
.w-popover.rightTop .w-popover-arrow {
    top: 15px;
}
.w-popover.leftBottom .w-popover-arrow,
.w-popover.rightBottom .w-popover-arrow {
    bottom: 0;
    top: auto;
}
.w-popover.top .w-popover-arrow,
.w-popover.topLeft .w-popover-arrow,
.w-popover.topRight .w-popover-arrow {
    transform: rotate(-90deg);
    bottom: 2px;
    left: 50%;
    margin-left: -15px;
}
.w-popover.bottom .w-popover-arrow,
.w-popover.bottomLeft .w-popover-arrow,
.w-popover.bottomRight .w-popover-arrow {
    transform: rotate(90deg);
    left: 50%;
    margin-left: -15px;
    top: 2px;
}
.w-popover.bottomLeft .w-popover-arrow,
.w-popover.topLeft .w-popover-arrow {
    left: 15px;
}
.w-popover.bottomRight .w-popover-arrow,
.w-popover.topRight .w-popover-arrow {
    right: 0;
    left: auto;
}
.w-popover.top,
.w-popover.topLeft,
.w-popover.topRight {
    padding-bottom: 13px;
}
.w-popover.bottom,
.w-popover.bottomLeft,
.w-popover.bottomRight {
    padding-top: 13px;
}
.w-popover.right,
.w-popover.rightTop,
.w-popover.rightBottom {
    padding-left: 13px;
}
.w-popover.left,
.w-popover.leftTop,
.w-popover.leftBottom {
    padding-right: 13px;
}
.w-popover.no-arrow {
    padding: 0 !important;
}
`;

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
  onClick?: Function;
}


export type PopoverRef = {
    hide: () => void;
    show: () => void;
};
const PopoverComp = React.forwardRef<PopoverRef, PopoverProps>((props, ref) => {
    const overLayRef = useRef(null);
    const {
        prefixCls = 'w-popover',
        placement = 'top',
        usePortal = true,
        visibleArrow = true,
        className, 
        content,
        ...other
    } = props;

    const [isOpen, setIsOpen] = useState(!!props.isOpen);
    
    useEffect(() => {
        if (props.isOpen !== isOpen) {
            setIsOpen(!!props.isOpen);
        }
    }, [props.isOpen]);

    React.useImperativeHandle(ref, () => ({
        // @ts-ignore
        hide: () => overLayRef.current.hide(),
        // @ts-ignore
        show: () => overLayRef.current.show()
    }));

    const renderArrow = () => {
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
  
    const cls = [prefixCls, className, !visibleArrow ? 'no-arrow' : null].filter(Boolean).join(' ').trim();

    return (
        <>
            <style jsx>{css}</style>
            <OverLayTriggerComp
                ref={overLayRef}
                {...other}
                isOpen={isOpen}
                placement={placement}
                overlay={
                    <div className={cls}>
                        {visibleArrow && renderArrow()}
                        <div className={`${prefixCls}-inner`}>{props.content}</div>
                    </div>
                }
            >
                {typeof props.children === 'object' && (props.children as JSX.Element).type.name !== 'Icon' ? (
                    props.children
                ) : (
                    <span style={{ display: 'block', writingMode: 'vertical-rl' }}>{props.children}</span>
                )}
            </OverLayTriggerComp>
        </>
        
    );
});

PopoverComp.displayName = "PopoverComp";
export default PopoverComp;