import { EditorState } from 'draft-js';
import React, { useState, useEffect, useRef } from 'react';
import { selectionHasInlineStyle, toggleSelectionFontSize } from '../../utils/content';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import './fontSize.css';

export const fontSizes = [
    12,
    14,
    16,
    18,
    20,
    24,
    28,
    30,
    32,
    36,
    40,
    48,
    56,
    64,
    72,
    96,
    120,
    144,
]
type FontSizeProps = {
    editorState: EditorState;
    onChange: Function;
    classNames?: string;
    requestFocus?: Function;
}
const FontSizeToolBar = (props: FontSizeProps) => {
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);
    
    const [currentFontSize, setCurrentFontSize] = useState<number>();
    const toggleFontSize = (fontSize: number) => {
        props.onChange(
            toggleSelectionFontSize(props.editorState, fontSize+""),
        );
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
        props.requestFocus && props.requestFocus();
    };

    useEffect(()=>{
        fontSizes.find((item) => {
            if (selectionHasInlineStyle(props.editorState, `FONTSIZE-${item}`)) {
                setCurrentFontSize(item);
                return true;
            }
            return false;
        });
    }, [])

    const content = (
        <div className='fontSizeMenu'>
           {fontSizes.map((item) => {
                return (
                    <div
                        key={item}
                        className={classNames('fontSizeItem', {'active': currentFontSize==item})}
                        onClick={()=>toggleFontSize(item)}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );

    return (
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp placement="top" overlay={<small className='p-1'>{t('fontSize')}</small>}>
                    <i className='iconfont icon-zitidaxiao1 fs-3 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
};
export default FontSizeToolBar;
