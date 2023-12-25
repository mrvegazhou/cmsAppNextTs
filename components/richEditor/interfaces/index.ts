import {
    MouseEvent
} from 'react';
import {
    Editor,
    EditorState,
    RawDraftContentBlock,
    RawDraftEntity,
    ContentBlock,
    DraftInlineStyle
} from 'draft-js';

export type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;
export type DraftEditorType = Editor;
export interface MyDraftEditorProps extends Partial<DraftEditorType> {
    classNames?: string;
    style?: React.CSSProperties;
    id?: string;
    height?: string;
    content?: string;
    customStyleFn?: ((style: DraftInlineStyle, block: ContentBlock, output:{}) => React.CSSProperties) | undefined;
    onSave?: Function;
    onDelete?: Function;
    handleReturn?: Function;
    // 复制图片到编辑器
    pasteImage?: boolean;
    // 复制张数
    imagePasteLimit?: number;
    // 验证图片
    pasteImageValidateFn?: Function;
}
export type RawDraftContentState = {
    blocks: Array<RawDraftContentBlock>,
    entityMap: {[key: string]: RawDraftEntity},
};
export type OnChangeType = (editorState: EditorState, callback?:(editorState: EditorState)=>void) => void;

export type AddImageProps = {
    url: string;
    description: string;
    dataURL: string;
    width: number;
    height: number;
};

export type AddMediaProps = {
    url: string;
    linkTarget?: boolean;
    description?: string;
    width: number;
    height: number;
    type: string;
};