import React, { useEffect, useImperativeHandle } from 'react';
import { IProps, HTMLInputProps } from '@/interfaces';
import './style/input.scss';
import classNames from 'classnames';
export * from './InputNumber';
export { default as InputNumber } from './InputNumber';

export interface InputProps extends IProps, Omit<HTMLInputProps, 'size'> {
    preIcon?: string;
    addonAfter?: React.ReactNode;
    size?: 'large' | 'default' | 'small';
    inputStyle?: React.CSSProperties;
}

const InputComp =  React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    prefixCls = 'w-input',
    className,
    style,
    size = 'default',
    type = 'text',
    preIcon = null,
    addonAfter,
    inputStyle,
    ...otherProps
  } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const addonRef = React.useRef<HTMLSpanElement>(null);
  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => inputRef.current);
  const cls = [
    prefixCls,
    className,
    size ? `${prefixCls}-${size}` : null,
    addonAfter ? `${prefixCls}-addon` : null,
    props.disabled ? 'disabled' : null,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  useEffect(() => {
    computedInputPadding();
  });

  function computedInputPadding() {
    if (addonRef.current && inputRef.current) {
      const input = window && window.getComputedStyle(addonRef.current, null);
      inputRef.current.style.paddingRight = `${
        addonRef.current.clientWidth + parseInt(input.right as string, 10) * 2
      }px`;
    }
  }
  return (
    <div className={cls} style={style}>
      {preIcon && (<i className={classNames(['iconfont', preIcon])} />)}
      <input
        ref={inputRef}
        type={type}
        autoComplete="off"
        {...otherProps}
        style={inputStyle}
        className={`${prefixCls}-inner`}
      />
      {addonAfter && (
        <span className={`${prefixCls}-addon-after`} ref={addonRef}>
          {addonAfter}
        </span>
      )}
    </div>
  );
});
InputComp.displayName = "InputComp";
export default InputComp;