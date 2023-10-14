import React, { useState, useEffect } from 'react';
import { IProps, HTMLDivProps } from '@/interfaces';
import styles from './backTop.module.scss';

interface ChildrenFunction {
    scrollToTop: () => void;
    percent: number;
    current: number;
}

interface BackTopProps extends IProps, Omit<HTMLDivProps, 'children' | 'content'> {
    offsetTop?: number;
    clickable?: boolean;
    content?: JSX.Element | string;
    fixed?: boolean;
    /**
     * 滚动距离多少时显示组件
     */
    showBelow?: number;
    speed?: number;
    children?: React.ReactNode | ((props: ChildrenFunction) => React.ReactNode);
}

/**
 * 获取当前滚动条所在位置
 */
function getScrollTop() {
    let scrollTop = 0;
    if (document && document.documentElement && document.documentElement.scrollTop) {
      scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
      scrollTop = document.body.scrollTop;
    }
    return scrollTop;
}
  
/**
 * TODO
 * @param {*} position 滚动到何处
 * @param {*} step 步长
 * @param {*} current 滚动条当前位置
 */
function scrollToAnimate(position: number = 0, step: number = 100, current: number = 0) {
    let start = 0;
    const timer = setInterval(() => {
      if (current - start >= position) {
        start += step;
        if (current - start >= position) {
          window.scrollTo(0, current - start);
        } else {
          window.scrollTo(0, position);
        }
      } else {
        clearInterval(timer);
      }
    }, 0);
}
/**
 * 获取滚动条位置百分比
 */
function getScrollPercent(offsetTop: number = 0) {
    let percent = 0;
    if (offsetTop < getScrollTop()) {
      percent = Math.round(
        ((getScrollTop() - offsetTop) / (document.body.scrollHeight - offsetTop - window.innerHeight)) * 100,
      );
    }
    return percent > 100 ? 100 : percent;
}

const BackTopComp = React.forwardRef<HTMLDivElement, BackTopProps>((props, ref) => {
    const {
      prefixCls = styles.wBackTop,
      className,
      content,
      children,
      offsetTop = 0,
      fixed = true,
      speed = 100,
      showBelow = 1,
      clickable = true,
      ...other
    } = props;
    const topShowBelow = !fixed ? 0 : showBelow || 0;
    const [percent, setPercent] = useState(0);
    const [current, setCurrent] = useState(0);
    const [_, setVissible] = useState(percent >= topShowBelow);
    const flag = percent >= topShowBelow;
    const isBrowser = () => typeof window !== 'undefined';

    const cls = [
      prefixCls,
      className,
      !fixed ? styles.noFixed : null,
      flag ? styles.wBackTopShow : null,
      !flag ? styles.wBackTopHide : null,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    useEffect(() => {
      if (isBrowser()) {
        setVissible(getScrollTop()>=window.innerHeight)
      }
      setPercent(getScrollPercent(offsetTop));
    }, []);

    useEffect(() => {
      window && window.addEventListener('scroll', onScroll);
      return function () {
        window && window.removeEventListener('scroll', onScroll);
      };
    });

    function onScroll() {
      setPercent(getScrollPercent(offsetTop));
      setCurrent(getScrollTop());
    }

    function scrollToTop() {
      if (typeof offsetTop === 'number' && typeof speed === 'number' && typeof current === 'number') {
        scrollToAnimate(offsetTop, speed, current);
        if (percent==0) {
          setVissible(false);
        }
      }
    }

    return (
      <div onClick={() => clickable && scrollToTop()} className={cls} {...other} ref={ref}>
        {content}
        {typeof children !== 'function' ? children : children({ percent, current, scrollToTop: scrollToTop })}
      </div>
    );
});
BackTopComp.displayName = "BackTop";
export default BackTopComp;