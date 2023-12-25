import React from 'react';
import { IProps } from '@/interfaces';

export interface MenuDividerProps extends IProps, Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
    title?: React.ReactNode;
}

export const MenuDivider = React.forwardRef<HTMLLIElement, MenuDividerProps>((props, ref) => {
    const { prefixCls = 'w-menu-divider', className, title, ...htmlProps } = props;
    const cls = [prefixCls, className].filter(Boolean).join(' ').trim();
    if (!title) {
        return <li {...htmlProps} ref={ref} className={cls} />;
    }
    return (
        <li {...htmlProps} ref={ref} className={cls} data-menu="divider">
            <strong>{title}</strong>
        </li>
    );
});

MenuDivider.displayName = 'uiw.MenuDivider';