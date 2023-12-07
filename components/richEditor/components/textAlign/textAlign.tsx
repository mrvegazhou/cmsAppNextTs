import React, 
{
    useRef,
    MouseEvent,
    useState
} from 'react';
import { 
    EditorState
} from 'draft-js';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import { 
    getSelectionBlockData,
    toggleSelectionAlignment
} from '../../utils/content'; 
import { handleDrop } from '@/lib/tool';
import './textAlign.css';

export interface textAlignToolBarProps {
    onChange: Function;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: Function;
    requestFocus?: Function;
}
enum AlignType {
    CENTER = 'center',
    LEFT = 'left',
    RIGHT = 'right',
    JUSTIFY = 'justify',
}
const TextAlignToolBar = (props: textAlignToolBarProps) => {
    
    const t = useTranslations('RichEditor');
    const popoverCompRef = useRef(null);

    let currentAlignment = getSelectionBlockData(props.editorState, 'textAlign');

    const TEXT_ALIGN_STYLES = [
        {label: <i className='iconfont icon-zuoduiqi fs-4 opacity-50'></i>, style: AlignType.LEFT},
        {label: <i className='iconfont icon-youduiqi fs-4 opacity-50'></i>, style: AlignType.RIGHT},
        {label: <i className='iconfont icon-juzhongduiqi fs-4 opacity-50'></i>, style: AlignType.CENTER},
        {label: <i className='iconfont icon-zuoyouduiqi fs-4 opacity-50'></i>, style: AlignType.JUSTIFY},
    ];

    let currentLabel = TEXT_ALIGN_STYLES.filter((item)=>{
        return item.style==currentAlignment;
    });

    const setAlignment = (event: MouseEvent<HTMLSpanElement>, align: string) => {
        handleDrop(event);
        props.onChange(toggleSelectionAlignment(props.editorState, align));
        props.requestFocus && props.requestFocus();
    };

    const content = (
        <div className='textAlignMenu'>
           {TEXT_ALIGN_STYLES.map((item) => {
                return (
                    <div
                        key={item.style}
                        className={classNames('textAlignItem cursor-pointer')}
                        onClick={(e)=>setAlignment(e, item.style)}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );

    return (
        <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp placement="top" overlay={<small className='p-1'>{t('align')}</small>}>
                    {currentLabel.length>0 ? currentLabel[0].label : (<i className='iconfont icon-zuoduiqi fs-4 opacity-50'></i>)}
                </OverLayTriggerComp>
            </span>
        </PopoverComp>
    );
}

export default TextAlignToolBar;