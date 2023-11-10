import { 
    Modifier, 
    EditorState,
    RichUtils, 
    ContentBlock
} from 'draft-js'


/**
 * Function will handle followind keyPress scenario:
 * case Shift+Enter, select not collapsed ->
 *   selected text will be removed and line break will be inserted.
 */
export const addLineBreakRemovingSelection = (editorState: EditorState) => {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    let newContent = Modifier.removeRange(content, selection, 'forward');
    const fragment = newContent.getSelectionAfter();
    const block = newContent.getBlockForKey(fragment.getStartKey());
    newContent = Modifier.insertText(
      newContent,
      fragment,
      '\n',
      block.getInlineStyleAt(fragment.getStartOffset()),
      undefined
    );
    return EditorState.push(editorState, newContent, 'insert-fragment');
}

/**
 * Function will inset a new unstyled block.
 */
export function insertNewUnstyledBlock(editorState: EditorState) {
    const newContentState = Modifier.splitBlock(
      editorState.getCurrentContent(),
      editorState.getSelection()
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'split-block'
    );
    return removeSelectedBlocksStyle(newEditorState);
}

/**
 * Function will change block style to unstyled for selected blocks.
 * RichUtils.tryToRemoveBlockStyle does not workd for blocks of length greater than 1.
 */
export function removeSelectedBlocksStyle(editorState: EditorState) {
    const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);
    if (newContentState) {
      return EditorState.push(editorState, newContentState, 'change-block-type');
    }
    return editorState;
}
  
/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksMap(editorState: EditorState) {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    const blockMap = contentState.getBlockMap();
    return blockMap
      .toSeq()
      .skipUntil((_, k) => k === startKey)
      .takeUntil((_, k) => k === endKey)
      .concat([[endKey, blockMap.get(endKey)]]) as ContentBlock;
}

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksList(editorState: EditorState) {
  return getSelectedBlocksMap(editorState).toList();
}

/**
 * Function returns the first selected block.
 */
export function getSelectedBlock(editorState: EditorState) {
  if (editorState) {
    return getSelectedBlocksList(editorState).get(0);
  }
  return undefined;
}