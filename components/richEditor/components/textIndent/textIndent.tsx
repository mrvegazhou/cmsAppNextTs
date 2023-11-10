import { 
    MouseEvent, useState, useEffect
} from "react";
import { 
    Entity,
    EditorState,
    AtomicBlockUtils
} from 'draft-js';
import classNames from 'classnames';
import { increaseSelectionIndent, decreaseSelectionIndent } from "../../utils/content";

type onChangeType = (editorState: EditorState, callback:((editorState:EditorState)=>void) | undefined) => void;

type TextIndentToolBarProps = {
    editorState: EditorState;
    onChange: onChangeType;
    classNames?: string;
}
export const TextIndentToolBar = (props: TextIndentToolBarProps) => {
    const [currentIndent, setCurrentIndent] = useState(0);

    const increaseIndent = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        let [newEditorState, indent] = increaseSelectionIndent(props.editorState);
        props.onChange(newEditorState, undefined);
        setCurrentIndent(indent);
    };

    const decreaseIndent = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        let [newEditorState, indent] = decreaseSelectionIndent(props.editorState)
        props.onChange(newEditorState, undefined);
        setCurrentIndent(indent);
    };
    
    useEffect(() => {

    }, []);

    return (
        <>
            <span className={classNames("cursor-pointer me-4", props.classNames, currentIndent > 0 && currentIndent < 6 ? 'text-primary' : '', {'pe-none': currentIndent >= 6} )} onMouseDown={increaseIndent}>
                <i className='iconfont icon-format-indent-increase fs-4 text-black-50'></i>
            </span>
            <span className={classNames("cursor-pointer me-4", props.classNames, {'pe-none':currentIndent <= 0} )} onMouseDown={decreaseIndent}>
                <i className='iconfont icon-formatindentdecrease fs-4 text-black-50'></i>
            </span>
        </>
    );
}