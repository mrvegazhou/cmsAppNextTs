import { 
    Editor,
    EditorState,
    RichUtils,
    Modifier
} from 'draft-js';
// @ts-expect-error
import editOnCopy from "draft-js/lib/editOnCopy";
// @ts-expect-error
import editOnCut from "draft-js/lib/editOnCut";
import { MyDraftEditorProps, OnChangeType, SyntheticKeyboardEvent } from '../interfaces';
import { 
    getDraftEditorPastedContent, 
    insertImage, 
    draftEditorCopyCutListener, 
    toggleSelectionBlockType, 
    getSelectionBlock, 
    getSelectionBlockType, 
    increaseSelectionIndent, 
    decreaseSelectionIndent, 
    insertText,
    getSelectedBlocks
} from './content';
import { handleNewLine } from './keyPress';
import { UploadImage } from '../components/image/image';

export const keyCommandHandlers = (command: string, editorState: EditorState, editorProps: MyDraftEditorProps, onChange: OnChangeType, event: SyntheticKeyboardEvent) => {
    if (command === 'richEditor-save') {
        if (editorProps.onSave) {
            editorProps.onSave(editorState);
        }
        return 'handled';
    }
    const codeTabIndents = 2;
    const cursorStart = editorState.getSelection().getStartOffset();
    const cursorEnd = editorState.getSelection().getEndOffset();
    const cursorIsAtFirst = cursorStart === 0 && cursorEnd === 0;
    if (command === 'backspace') {
        if (editorProps.onDelete && editorProps.onDelete(editorState) === false) {
            return 'handled';
        }
        const blockType = getSelectionBlockType(editorState);
        if (cursorIsAtFirst && blockType !== 'code-block') {
            let [newEditorState, _] = decreaseSelectionIndent(editorState)
            onChange(newEditorState);
        }
    }
    if (command === 'tab') {
        const blockType = getSelectionBlockType(editorState);
        if (blockType === 'code-block') {
            onChange(
                insertText(
                  editorState,
                  ' '.repeat(codeTabIndents),
                  undefined, undefined
                )
            );
            return 'handled';
        }
        if (
            blockType === 'ordered-list-item' ||
            blockType === 'unordered-list-item'
        ) {
            const newEditorState = RichUtils.onTab(event, editorState, 4);
            if (newEditorState !== editorState) {
                onChange(newEditorState);
            }
            return 'handled';
        }
        if (blockType !== 'atomic' && cursorIsAtFirst) {
            onChange(increaseSelectionIndent(editorState)[0]);
            return 'handled';
        }
    }
    
    const nextEditorState = RichUtils.handleKeyCommand(editorState, command);
    if (nextEditorState) {
        onChange(nextEditorState);
        return 'handled';
    }
    
    return 'not-handled';

};

export const returnHandlers = (e: SyntheticKeyboardEvent, editorState: EditorState, editorProps: MyDraftEditorProps, onChange: OnChangeType) => {
    if (
        editorProps.handleReturn &&
        editorProps.handleReturn(e, editorState) === 'handled'
    ) {
        return 'handled';
    }

    const currentBlock = getSelectionBlock(editorState);
    const currentBlockType = currentBlock.getType();

    if (
        currentBlockType === 'unordered-list-item' ||
        currentBlockType === 'ordered-list-item'
    ) {
        if (currentBlock.getLength() === 0) {
          onChange(
            toggleSelectionBlockType(editorState, 'unstyled'),
          );
          return 'handled';
        }
    
        return 'not-handled';
    }

    if (currentBlockType === 'code-block') {
        if (
          e.which === 13 &&
          (e.getModifierState('Shift') ||
            e.getModifierState('Alt') ||
            e.getModifierState('Control'))
        ) {
          onChange(
            toggleSelectionBlockType(editorState, 'unstyled'),
          );
          return 'handled';
        }
    
        return 'not-handled';
    }

    if (currentBlockType === 'blockquote') {
        if (e.which === 13) {
          if (
            e.getModifierState('Shift') ||
            e.getModifierState('Alt') ||
            e.getModifierState('Control')
          ) {
            // eslint-disable-next-line no-param-reassign
            e.which = 0;
          } else {
            onChange(RichUtils.insertSoftNewline(editorState));
            return 'handled';
          }
        }
    }

    const nextEditorState = handleNewLine(editorState, e);
    if (nextEditorState) {
        onChange(nextEditorState);
        return 'handled';
    }

    return 'not-handled';
}

type EditorProps = {
    pasteImage?: boolean;
    imagePasteLimit?: number;
    pasteImageValidateFn?: Function;
    editorState: EditorState;
    onChange: Function;
    isLiving?: boolean;
}
export const handleFiles = (files: File[], editorProps: EditorProps) => {
    const pasteImage = editorProps.pasteImage ?? true;
    const imagePasteLimit = editorProps.imagePasteLimit ?? 1;
    const pasteImageValidateFn = editorProps.pasteImageValidateFn;
    const isLiving = editorProps.isLiving ?? true;
    if (pasteImage) {
        files.slice(0, imagePasteLimit).forEach(async (file) => {
            if (file && file.type.indexOf('image') > -1) {
                const validateResult = pasteImageValidateFn ? pasteImageValidateFn(file) : true;
                if (validateResult instanceof Promise) {
                    validateResult.then(async () => {
                        const imgs = await UploadImage([file])
                        if (isLiving && imgs.length>0) {
                            editorProps.onChange(
                                insertImage(editorProps.editorState, imgs[0]),
                            );
                        }
                    });
                } else if (validateResult) {
                    const imgs = await UploadImage([file])
                    if (isLiving && imgs.length>0) {
                        editorProps.onChange(
                            insertImage(editorProps.editorState, imgs[0]),
                        );
                    }
                }
            }
        });
    }

    if (files[0] && files[0].type.indexOf('image') > -1 && pasteImage) {
        return 'handled';
    }
    return 'not-handled';
};

export const copyHandlers = (editor: Editor, event: React.ClipboardEvent<HTMLElement>) => {
    // @ts-ignore
    draftEditorCopyCutListener(editor, event);
    editOnCopy(editor, event);
};

export const cutHandlers = (editor: Editor, event: React.ClipboardEvent<HTMLElement>,) => {
    // @ts-expect-error
    draftEditorCopyCutListener(editor, event);
    editOnCut(editor, event);
};

/**
 * Handles pastes coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 * This SHOULD NOT be used for stripPastedStyles editor.
 */
export const handlePastedText = (
    html: string | undefined,
    editorState: EditorState,
    onChange: Function
  ) => {
    const pastedContent = getDraftEditorPastedContent(html);
  
    if (pastedContent) {
        const fragment = pastedContent.getBlockMap();

        const content = Modifier.replaceWithFragment(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            fragment,
        );
        let newState = EditorState.push(editorState, content, "insert-fragment");
        if (newState) {
            onChange(newState);
            return "handled";
        }
        return "not-handled";
    }
    return "not-handled";
};

export const compositionStartHandler = (editorState: EditorState, onChange: Function) => {

    const selectedBlocks = getSelectedBlocks(editorState);

    if (selectedBlocks && selectedBlocks.length > 1) {
      const nextEditorState = EditorState.push(
        editorState,
        Modifier.removeRange(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          'backward',
        ),
        'remove-range',
      );
      onChange(nextEditorState);
    }
};
