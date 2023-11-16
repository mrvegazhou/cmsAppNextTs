import { 
    Modifier, 
    EditorState,
    SelectionState,
    ContentState,
    ContentBlock
} from 'draft-js'
import { getSelectedBlocksMap } from './block';

export const removeInlineStyles = (editorState: EditorState, styleName: string) => {
    const styles = [
        'BOLD',
        'ITALIC',
        'UNDERLINE',
        'STRIKETHROUGH',
        'CODE',
        'SUBSCRIPT',
        'SUPERSCRIPT'
    ];
    const contentState = editorState.getCurrentContent();
    let contentWithoutStyles;
    if(styleName) {
        if(!styles.includes(styleName)) {
            return editorState;
        }
        contentWithoutStyles = Modifier.removeInlineStyle(
            contentState,
            editorState.getSelection(),
            styleName
        )
    } else {
        contentWithoutStyles = styles.reduce(
            (newContentState, style) =>
              Modifier.removeInlineStyle(
                newContentState,
                editorState.getSelection(),
                style
              ),
            contentState
        );
    }
    const newEditorState = EditorState.push(
      editorState,
      contentWithoutStyles,
      'change-inline-style'
    );
  
    return newEditorState;
};

export const removeBlock = (editorState: EditorState, block: ContentBlock, lastSelection = null) => {
  let nextContentState, nextEditorState
  const blockKey = block.getKey()

  nextContentState = Modifier.removeRange(editorState.getCurrentContent(), new SelectionState({
    anchorKey: blockKey,
    anchorOffset: 0,
    focusKey: blockKey,
    focusOffset: block.getLength()
  }), 'backward')

  nextContentState = Modifier.setBlockType(nextContentState, nextContentState.getSelectionAfter(), 'unstyled')
  nextEditorState = EditorState.push(editorState, nextContentState, 'remove-range')
  return EditorState.forceSelection(nextEditorState, lastSelection || nextContentState.getSelectionAfter())

}

export const removeBlockTypes = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent();
    const blocksMap = getSelectedBlocksMap(editorState);
    const contentWithoutBlocks = blocksMap.reduce<ContentState | undefined>((newContentState: ContentState | undefined, block: ContentBlock | undefined) => {
      const blockType = block!.getType();
      if (blockType === 'unstyled') {
        const selectionState = SelectionState.createEmpty(block!.getKey());
        const updatedSelection = selectionState.merge({
          focusOffset: 0,
          anchorOffset: block!.getText().length
        });
  
        return Modifier.setBlockType(newContentState!, updatedSelection, 'unstyled');
      }
      return newContentState;
    }, contentState);
  
    const newEditorState = EditorState.push(
      editorState,
      contentWithoutBlocks!,
      'change-block-type'
    );
  
    return newEditorState;
};

export const removeEntities = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent();
    const contentWithoutEntities = Modifier.applyEntity(
      contentState,
      editorState.getSelection(),
      null
    );
  
    const newEditorState = EditorState.push(
      editorState,
      contentWithoutEntities,
      'apply-entity'
    );
  
    return newEditorState;
};