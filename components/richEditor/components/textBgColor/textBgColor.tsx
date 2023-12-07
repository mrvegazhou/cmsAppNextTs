import { EditorState } from 'draft-js';
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import { toggleSelectionBackgroundColor } from '../../utils/content';
import ColorPicker from '../colorPicker/colorPicker';
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';

const colors = [
    '#000000',
    '#333333',
    '#666666',
    '#999999',
    '#cccccc',
    '#ffffff',
    '#61a951',
    '#16a085',
    '#07a9fe',
    '#003ba5',
    '#8e44ad',
    '#f32784',
    '#c0392b',
    '#d35400',
    '#f39c12',
    '#fdda00',
];
type TextBgColorProps = {
    editorState: EditorState;
    classNames?: string;
    onChange: Function;
}
const TextBgColortToolbar = (props: TextBgColorProps) => {

    const t = useTranslations('RichEditor');
    const [currentColor, setCurrentColor] = useState("");
    const popoverCompRef = useRef(null);

    useEffect(()=>{
        const selectionStyles = props.editorState.getCurrentInlineStyle().toJS();
        selectionStyles.forEach((style: string) => {
            if (style.indexOf('BGCOLOR-') === 0) {
                setCurrentColor(`#${style.split('-')[1]}`);
            }
        });
    }, []);

    const toggleColor = (color: string, closePicker: boolean) => {
        if (color) {
            setCurrentColor("#"+color);
            props.onChange(
                toggleSelectionBackgroundColor(props.editorState, color)
            );
        }
        if (closePicker) {
            // @ts-ignore
            popoverCompRef.current && popoverCompRef.current.hide();
        }
    };

    const content = (
        <div className='w-auto'>
            <ColorPicker
                color={currentColor}
                presetColors={colors}
                onChange={toggleColor}
            />
        </div>
    );

    return (
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content} usePortal={false}>
            <span style={{color: currentColor}} className={classNames("cursor-pointer me-4", props.classNames, {'text-black': currentColor==''})} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp placement="top" overlay={<small className='p-1'>{t('background')}</small>}>
                    <i className='iconfont icon-ziyuan fs-4 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
}

export default TextBgColortToolbar;