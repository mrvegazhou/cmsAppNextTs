import { EditorState } from 'draft-js';
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import PopoverComp from '@/components/popover/popover';
import { insertTable } from './utils';
import useToast from '@/hooks/useToast';
import { handleDrop } from '@/lib/tool';

type TableToolBarProps = {
    editorState: EditorState;
    classNames?: string;
    onChange: Function;
    requestFocus: Function;
    requestBlur: Function;
};
const TableToolBar = (props: TableToolBarProps) => {
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);
    const overLayRef = useRef(null);
    const [cellCount, setCellCount] = useState({rowCount: 3, columnCount: 3});
    const { show } = useToast();

    const addTbl = () => {
        if (!Number.isInteger(cellCount.columnCount) || !Number.isInteger(cellCount.rowCount)) {
            show({
                type: 'DANGER',
                message: t('cellCountErr'),
            });
            return;
        }
        if (cellCount.columnCount!=0 && cellCount.rowCount!=0) {
            props.onChange(insertTable(props.editorState, cellCount.columnCount, cellCount.rowCount));
        }
        props.requestFocus && props.requestFocus();
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleDrop(event);
        let name = event.target.name;
        let val = Number(event.target.value)
        if(name=="columnCount") {
            setCellCount( prev => {
                return Object.assign({}, prev, {columnCount: val});
            });
        } else if(name=="rowCount") {
            setCellCount( prev => {
                return Object.assign({}, prev, {rowCount: val});
            });
        }
    };

    const handleCententClick = (event: React.MouseEvent) => {
        handleDrop(event);
        props.requestBlur && props.requestBlur();
    };

    const content = (
        <div className="card border-0" onClick={handleCententClick}>
            <div className="mx-3 mt-3 mb-2 align-items-center d-flex flex-row">
                <div className="col-auto me-2">
                    <label className="col-form-label">{t("rowCount")}</label>
                </div>
                <div className="col-auto">
                    <input className="form-control" style={{width:'90px'}} placeholder={t("rowCount")} type="text" value={cellCount.columnCount}  name="columnCount" onChange={handleChange} />
                </div>
            </div>
            <div className="mx-3 my-1 align-items-center d-flex flex-row">
                <div className="col-auto me-2">
                    <label className="col-form-label">{t("columnCount")}</label>
                </div>
                <div className="col-auto">
                    <input className="form-control" style={{width:'90px'}} placeholder={t("columnCount")} type="text" value={cellCount.rowCount} name="rowCount" onChange={handleChange} />
                </div>
            </div>
            <div className="text-center col-12">
                <button type="button" className="btn btn-outline-primary my-3 w-50 btn-sm" onClick={addTbl}><span>{t('submit')}</span></button>
            </div>
        </div>
    );


    return (
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={handleCententClick}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('table')}</small>}>
                    <i className='iconfont icon-table fs-4 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
};
export default TableToolBar;