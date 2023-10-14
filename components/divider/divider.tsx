import React from 'react';
import { IProps, HTMLDivProps } from '@/interfaces';
import styles from "./divider.module.scss";

export interface DividerProps extends IProps, HTMLDivProps {
    dashed?: boolean;
    type?: 'Horizontal' | 'Vertical';
    align?: 'Left' | 'Right' | 'Center';
}

const DividerComp = React.forwardRef<HTMLDivElement, DividerProps>((props, ref) => {
    const {
        prefixCls = styles['wDivider'],
        className,
        children,
        dashed = false,
        type = 'Horizontal',
        align = 'Center',
        ...restProps
    } = props;
    
    const cls = [
        className,
        prefixCls,
        prefixCls && type ? styles[`wDivider${type}`] : null,
        prefixCls && align ? styles[`wDivider${align}`] : null,
        children ? styles[`wDividerWithText`] : null,
        !!dashed ? styles[`wDividerDashed`] : null,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();
    
    return (
        <div className={cls} {...restProps} ref={ref}>
          {children && <span className={styles[`wDividerInnerText`]}>{children}</span>}
        </div>
    );
});
DividerComp.displayName = 'DividerComp';
export default DividerComp;