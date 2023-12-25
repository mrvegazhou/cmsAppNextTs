import React from 'react';
import OverlayTrigger, { OverlayTriggerProps } from '../overlayTrigger';
import { IProps } from '@/interfaces';
import { useMemo } from 'react';

export interface DropdownProps extends IProps, OverlayTriggerProps {
    menu?: React.ReactNode;
    children?: React.ReactElement;
}

export default function Dropdown(props: DropdownProps) {
    const { prefixCls = 'w-dropdown', placement = 'bottomLeft', className, menu, children, disabled, ...other } = props;

    const cls = useMemo(() => [prefixCls, className].filter(Boolean).join(' ').trim(), [prefixCls, className]);

    return (
        <OverlayTrigger
            isOutside
            autoAdjustOverflow
            className={cls}
            disabled={disabled}
            placement={placement}
            {...other}
            overlay={menu}
        >   
            {React.cloneElement(children!, Object.assign({}, children!.props))}
        </OverlayTrigger>
    );
}