import React, { useEffect, useState, useRef } from 'react';
import { EditorState } from 'draft-js';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import { selectionHasInlineStyle, toggleSelectionWordSpace } from '../../utils/content';
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import './wordSpace.css';

const wordSpaces = [0, 1, 2, 3, 4, 5, 6];

type WordSpaceToolBarProps = {
    editorState: EditorState;
    onChange: Function;
    classNames?: string;
    requestFocus?: Function;
}
const WordSpaceToolBar = (props: WordSpaceToolBarProps) => {
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);
    const overLayRef = useRef(null);

    const [currentWordSpace, setCurrentWordSpace] = useState<number>();

    useEffect(()=>{
        wordSpaces.find((item) => {
            if ( selectionHasInlineStyle(props.editorState,`WORDSPACE-${item}`) ) {
                setCurrentWordSpace(item);
                return true;
            }
            return false;
        });
    }, []);

    const toggleWordSpace = (wordspace: number) => {
        props.onChange(
            toggleSelectionWordSpace(props.editorState, wordspace+"")
        );
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
        props.requestFocus && props.requestFocus();
    }

    const content = (
        <div className="wordSpaceMenu">
           {wordSpaces.map((item) => {
                return (
                    <div
                        key={item}
                        className={classNames('wordSpaceItem', {'active': currentWordSpace==item})}
                        onClick={()=>toggleWordSpace(item)}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content} usePortal={false}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('wordSpace')}</small>}>
                    <i className='iconfont icon-zijianju fs-4 opacity-50'></i>
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
        </>
    );
};
export default WordSpaceToolBar;