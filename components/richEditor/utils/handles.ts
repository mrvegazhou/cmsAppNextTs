import { 
    EditorState,
    RichUtils
} from 'draft-js';
import { MyDraftEditorProps, OnChangeType, SyntheticKeyboardEvent } from '../interfaces';
import { toggleSelectionBlockType, getSelectionBlock, getSelectionBlockType, increaseSelectionIndent, decreaseSelectionIndent, insertText } from './content';
import { handleNewLine } from './keyPress';

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
        if (
            editorProps.onDelete &&
            editorProps.onDelete(editorState) === false
        ) {
            return 'handled';
        }
        const blockType = getSelectionBlockType(editorState);
        if (cursorIsAtFirst && blockType !== 'code-block') {
            let [newEditorState ,_] = decreaseSelectionIndent(editorState)
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