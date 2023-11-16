import { 
    MouseEvent
} from "react";
import { 
    Entity,
    EditorState,
    AtomicBlockUtils
} from 'draft-js';
import classNames from 'classnames';

type DividerBlockProps = {

}
const DividerBlock = (props: DividerBlockProps) => {
    return (
        <hr className="hr richEditorHr" style={{width:'70%', marginLeft:'auto', marginRight:'auto'}}/>
    );
};
export default DividerBlock;

export interface DividerToolBarProps {
    setEditorState: (editorState: EditorState) => void;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: () => void;
}
export const DividerToolBar = (props: DividerToolBarProps) => {
    const createDivider = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        const entityKey = Entity.create(
            'Divider',
            'IMMUTABLE'
        );
        let neweditorState = AtomicBlockUtils.insertAtomicBlock(props.editorState, entityKey, ' ');
        props.setEditorState(neweditorState);
    };
    return (
        <>
            <span onClick={props.onClick} className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={createDivider}>
                <i className='iconfont icon-henggang fs-4 text-black-50'></i>
            </span>
        </>
    );
};
