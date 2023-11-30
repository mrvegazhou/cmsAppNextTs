import React, { useEffect, useState, useRef } from 'react';
import { EditorState } from 'draft-js';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import { selectionHasInlineStyle, toggleSelectionLineHeight } from '../../utils/content';
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import './lineHeight.css';

const lineHeights = [1, 1.2, 1.5, 1.75, 2, 2.5, 3, 4];

type LineHeightProps = {
    editorState: EditorState;
    onChange: Function;
    classNames?: string;
    requestFocus?: Function;
}
const LineHeightToolBar = (props: LineHeightProps) => {
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);
    const overLayRef = useRef(null);
    const [currentLineHeight, setCurrentLineHeight] = useState<number>(0);

    useEffect(()=>{
        lineHeights.find((item) => {
            if ( selectionHasInlineStyle(props.editorState,`LINEHEIGHT-${item}`) ) {
                setCurrentLineHeight(item);
                return true;
            }
            return false;
        });
    }, []);

    const toggleFontFamily = (height: number) => {
        props.onChange(toggleSelectionLineHeight(props.editorState, height+""));
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
        props.requestFocus && props.requestFocus();
    };

    const content = (
        <div className="lineHeightMenu">
           {lineHeights.map((item) => {
                return (
                    <div
                        key={item}
                        className={classNames('lineHeightItem', {'active': item==currentLineHeight})}
                        onClick={()=>toggleFontFamily(item)}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );

    const hidePop = ()=>{
        // @ts-ignore
        overLayRef.current && overLayRef.current.hide();
    }

    return (
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content} usePortal={false}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('lineHeight')}</small>}>
                    <i className='iconfont icon-hangjianju fs-4 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
};

export default LineHeightToolBar;