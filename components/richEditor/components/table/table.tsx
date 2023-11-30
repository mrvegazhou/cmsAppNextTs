import { EditorState } from 'draft-js';
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import { insertTable } from './utils';

type TableToolBarProps = {
    editorState: EditorState;
    classNames?: string;
    onChange: Function;
    
};
const TableToolBar = (props: TableToolBarProps) => {
    const overLayRef = useRef(null);
    const addTbl = () => {
        props.onChange(insertTable(props.editorState, 3, 3));
    };
    return (
        <span onClick={addTbl} className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
            <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>表格</small>}>
                <i className='iconfont icon-table fs-4 opacity-50'></i>
            </OverLayTriggerComp>
        </span>
    );
};
export default TableToolBar;