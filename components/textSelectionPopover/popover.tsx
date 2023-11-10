import React, { forwardRef, useCallback, useState, useImperativeHandle } from 'react'
import { useTextSelection } from './textSelection'
import { createPortal } from 'react-dom'
import styled from "styled-components";

interface IProps {
    children : React.ReactNode
}
const Portal = (props: IProps) => {
    return createPortal(props.children, document.body)
}

const PopoverToolBar = forwardRef(({ target }: { target?: HTMLElement }, ref) => {
    const { isCollapsed, clientRect, reset } = useTextSelection(target);
    useImperativeHandle(ref, ()=>{
      return {
        reset
      }
    });

    if (clientRect == null || isCollapsed) return null;

    let DivDom = styled.div`
    position: absolute;
    left: ${clientRect.left + clientRect.width / 2}px;
    top: ${clientRect.top - 50}px;
    margin-left: -50px;
    width: 100px;
    background: #6c757d;
    opacity: 0.7;
    border: none;
    text-align: center;
    color: #fff;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    padding: 0 5px;
    `;

    return (
        <Portal>
            <DivDom>
                <i className='iconfont icon-charulianjie fs-3 text-black-50 me-1'></i>
                <i className='iconfont icon-quxiaolianjie fs-3 text-black-50 me-1'></i>
                <i className='iconfont icon-cuti fs-3 text-black-50 me-1'></i>
                <i className='iconfont icon-zitixieti fs-3 text-black-50 me-1'></i>
                <i className='iconfont icon-xiahuaxian fs-3 text-black-50 me-1'></i>
            </DivDom>
        </Portal>
    );
});
PopoverToolBar.displayName = "PopoverToolBar";
export default PopoverToolBar;

export const Example = () => {
    const [target, setTarget] = useState<HTMLElement>()
    const ref = useCallback((el: any) => {
      if (el != null) {
        setTarget(el)
      } else {
        setTarget(undefined)
      }
    }, [])
  
    return <div>
      <h1><pre>use-text-selection</pre></h1>
      <div ref={ref}>Selecting text anywhere here will trigger the popover</div>
      <PopoverToolBar target={target}/>
    </div>
}

