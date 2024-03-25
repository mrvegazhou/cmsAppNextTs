import React from 'react';
import { IProps, HTMLSpanProps } from '@/interfaces';
import styles from './badge.module.scss';

export interface BadgeProps extends IProps, HTMLSpanProps {
    color?: string;
    dot?: boolean;
    processing?: boolean;
    max?: number;
    count?: number;
}

const BadgeComp =  React.forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
    const {
      prefixCls = styles.wBadge,
      className,
      style = {},
      color,
      max = 99,
      dot = false,
      processing = false,
      count,
      children,
      ...other
    } = props;

    const supProps = {
      className: [!dot ? styles.wBadgeCount : null, dot ? styles.dot : null].filter(Boolean).join(' ').trim(),
      style: {},
    };

    const cls = [
      className,
      prefixCls,
      !children ? styles.nowrap : null,
      !children ? `${prefixCls}Status` : null,
      processing ? styles.wStatusProcessing : null,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const warpperProps: HTMLSpanProps = {};

    if (count || count === 0) {
      supProps.style = { backgroundColor: color, ...style };
    } else {
      warpperProps.style = style || {};
    }

    return (
      <span className={cls} {...other} {...warpperProps} ref={ref}>
        {color && <span className={styles.wBadgeDot} style={{ backgroundColor: color }} />}
        {children}
        {count !== 0 && !color && <sup {...supProps}>{!dot && count && max && count > max ? `${max}+` : count}</sup>}
      </span>
    );
});
BadgeComp.displayName = "BadgeComp";
export default BadgeComp;