import {
    EditorState
} from 'draft-js';
import { getSelectedBlock } from './block';

/**
 * This function will return the entity applicable to whole of current selection.
 * An entity can not span multiple blocks.
 */
export function getSelectionEntity(editorState: EditorState) {
    let entity;
    const selection = editorState.getSelection();
    let start = selection.getStartOffset();
    let end = selection.getEndOffset();
    if (start === end && start === 0) {
      end = 1;
    } else if (start === end) {
      start -= 1;
    }
    const block = getSelectedBlock(editorState);
  
    for (let i = start; i < end; i += 1) {
      const currentEntity = block.getEntityAt(i);
      if (!currentEntity) {
        entity = undefined;
        break;
      }
      if (i === start) {
        entity = currentEntity;
      } else if (entity !== currentEntity) {
        entity = undefined;
        break;
      }
    }
    return entity;
}