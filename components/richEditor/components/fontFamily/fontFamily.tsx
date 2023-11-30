import { EditorState } from 'draft-js';
import React, { useState, useEffect, useRef } from 'react';
import { selectionHasInlineStyle, toggleSelectionFontFamily } from '../../utils/content';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import './fontFamily.css'
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';

export const fontFamilies = [
    {
      name: 'Araial',
      family: 'Arial, Helvetica, sans-serif',
    },
    {
      name: 'Georgia',
      family: 'Georgia, serif',
    },
    {
      name: 'Impact',
      family: 'Impact, serif',
    },
    {
      name: 'Monospace',
      family: '"Courier New", Courier, monospace',
    },
    {
      name: 'Tahoma',
      family: 'tahoma, arial, "Hiragino Sans GB", 宋体, sans-serif',
    },
];

type FontFamilyProps = {
    editorState: EditorState;
    onChange: Function;
    classNames?: string;
    requestFocus?: Function;
}
const FontFamilyToolBar = (props: FontFamilyProps) => {
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);
    const overLayRef = useRef(null);
    const [idx, setIdx] = useState<number>(0);

    useEffect(()=>{
        fontFamilies.find((item, index) => {
            if ( selectionHasInlineStyle(props.editorState,`FONTFAMILY-${item.name}`) ) {
                setIdx(index);
                return true;
            }
            return false;
        });
    }, []);

    const toggleFontFamily = (event: React.MouseEvent<HTMLElement>) => {
        let fontFamilyIdx = Number(event.currentTarget.dataset.idx) ?? 0;
        props.onChange(toggleSelectionFontFamily(props.editorState, fontFamilies[fontFamilyIdx].name));
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
        props.requestFocus && props.requestFocus();
    };

    const content = (
        <div className="fontFamilyMenu">
           {fontFamilies.map((item, idx) => {
                return (
                    <div
                        key={item.name}
                        className={classNames('fontFamilyItem', {'active': item.name==fontFamilies[idx].name})}
                        style={{ fontFamily: item.family }}
                        data-idx={idx}
                        onClick={toggleFontFamily}
                    >
                        {item.name}
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
            <span style={{fontFamily: fontFamilies[idx].family}} className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('fontFamily')}</small>}>
                    <i className='iconfont icon-zitishezhi fs-4 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
};

export default FontFamilyToolBar;