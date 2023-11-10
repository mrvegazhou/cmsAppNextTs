import React, 
{
    MouseEvent
} from 'react';
import { 
    EditorState
} from 'draft-js';
import classNames from 'classnames';
import { 
    getSelectionBlockData,
    toggleSelectionAlignment
} from '../../utils/content'; 

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
    
    let currentAlignment = getSelectionBlockData(props.editorState, 'textAlign');

    const setAlignment = (event: MouseEvent<HTMLSpanElement>) => {
        let { alignment } = event.currentTarget.dataset;
        props.onChange(toggleSelectionAlignment(props.editorState, alignment!));
        props.requestFocus && props.requestFocus();
    };

    const TEXT_ALIGN_STYLES = [
        {label: <i className='iconfont icon-zuoduiqi fs-4 text-black-50'></i>, style: AlignType.LEFT},
        {label: <i className='iconfont icon-youduiqi fs-4 text-black-50'></i>, style: AlignType.RIGHT},
        {label: <i className='iconfont icon-juzhongduiqi fs-4 text-black-50'></i>, style: AlignType.CENTER},
        {label: <i className='iconfont icon-zuoyouduiqi fs-4 text-black-50'></i>, style: AlignType.JUSTIFY},

    ];

    return (
        <>
            {TEXT_ALIGN_STYLES.map(item => (
                <span key={item.style} className={classNames("cursor-pointer", props.classNames, {"user-select-none opacity-50": currentAlignment==item.style})} 
                    data-alignment={item.style}
                    onClick={setAlignment}
                >
                    {item.label}
                </span>
            ))}
        </>
    );
}

export default TextAlignToolBar;