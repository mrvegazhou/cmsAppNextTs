import { 
    Modifier, 
    EditorState,
    DraftBlockType, 
    RichUtils, 
    EditorChangeType, 
    DraftEntityMutability,
    DraftInlineStyle,
    SelectionState,
    AtomicBlockUtils,
    ContentBlock
} from 'draft-js'
import Immutable from 'immutable'
import { getSelectionEntity } from './inline'


const strictBlockTypes = ['atomic']

export const getSelectionBlock = (editorState: EditorState) => {
    return editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getAnchorKey())
}

export const getSelectionBlockData = (editorState: EditorState, name: string) => {
    const blockData = getSelectionBlock(editorState).getData()
    return name ? blockData.get(name) : blockData
}

// 所以需要记录下之前所有的块样式，再在此基础上添加新的块样式
export const setSelectionBlockData = (editorState: EditorState, blockData: Immutable.Map<any, any>, override?: boolean) => {

    let newBlockData = override ? blockData : Object.assign({}, getSelectionBlockData(editorState, "").toJS(), blockData.toJS())
    Object.keys(newBlockData).forEach(key => {
      if (newBlockData.hasOwnProperty(key) && newBlockData[key] === undefined) {
        delete newBlockData[key]
      }
    })
  
    return setBlockData(editorState, newBlockData)
  
}

export function setBlockData(editorState: EditorState, data: Immutable.Map<any, any>) {
    const newContentState = Modifier.setBlockData(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      data
    );
    return EditorState.push(editorState, newContentState, 'change-block-data');
}

export const toggleSelectionIndent = (editorState: EditorState, textIndent: number, maxIndent = 6) => {
    return textIndent < 0 || textIndent > maxIndent || isNaN(textIndent) ? editorState : setSelectionBlockData(editorState, Immutable.Map({
      textIndent: textIndent || undefined
    }), false)
}

export const increaseSelectionIndent = (editorState: EditorState, maxIndent: number = 6) => {
    let currentIndent = getSelectionBlockData(editorState, 'textIndent') || 0;
    currentIndent = currentIndent + 1;
    return [toggleSelectionIndent(editorState, currentIndent, maxIndent), currentIndent]
}

export const decreaseSelectionIndent = (editorState: EditorState, maxIndent: number = 6) => {
    let currentIndent = getSelectionBlockData(editorState, 'textIndent') || 0
    currentIndent = currentIndent - 1;
    return [toggleSelectionIndent(editorState, currentIndent, maxIndent), currentIndent]
}

export const getSelectionBlockType = (editorState: EditorState) => {
    return getSelectionBlock(editorState).getType();
}

export const getSelectedBlocks = (editorState: EditorState) => {

    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
  
    const startKey = selectionState.getStartKey()
    const endKey = selectionState.getEndKey()
    const isSameBlock = startKey === endKey
    const startingBlock = contentState.getBlockForKey(startKey)
    const selectedBlocks = [startingBlock]
  
    if (!isSameBlock) {
      let blockKey = startKey
  
      while (blockKey !== endKey) {
        const nextBlock = contentState.getBlockAfter(blockKey)
        if (nextBlock) {
            selectedBlocks.push(nextBlock)
            blockKey = nextBlock.getKey()
        }
      }
    }
  
    return selectedBlocks
  
}

export const selectionContainsStrictBlock = (editorState: EditorState) => {
    // ~对返回值进行按位取反
    return getSelectedBlocks(editorState).find(block => ~strictBlockTypes.indexOf(block.getType()))
}

export const toggleSelectionBlockType = (editorState: EditorState, blockType: DraftBlockType) => {

    if (selectionContainsStrictBlock(editorState)) {
      return editorState
    }
    return RichUtils.toggleBlockType(editorState, blockType)
}

// 插入link
export const getSelectionEntityData = (editorState: EditorState, type: string) => {

    const entityKey = getSelectionEntity(editorState)
  
    if (entityKey) {
      const entity = editorState.getCurrentContent().getEntity(entityKey)
      if (entity && entity.getType() === type) {
        return entity.getData()
      } else {
        return {}
      }
    } else {
      return {}
    }
}

// 选中
export const getSelectionRange = (editorState: EditorState) => {
    const selectionState = editorState.getSelection();
    const start = selectionState.getStartOffset();

    const focusOffset = selectionState.getFocusOffset()
    const anchorKey = selectionState.getAnchorKey()

    let selectionState2 = SelectionState.createEmpty(anchorKey);

    selectionState2 = selectionState2.merge({
        anchorOffset: start,
        focusOffset: focusOffset,
        isBackward: false,
    });
    return EditorState.forceSelection(editorState, selectionState2);
}

// 添加链接
export const toggleSelectionLink = (editorState: EditorState, href?: string | boolean, target?: string, description?: string) => {
    const contentState = editorState.getCurrentContent()
    const selectionState = editorState.getSelection()
    let entityData = { href, target, description }

    if (selectionState.isCollapsed() || getSelectionBlockType(editorState) === 'atomic') {
        return editorState
    }
    if (href === false) {
        return RichUtils.toggleLink(editorState, selectionState, null)
    }
    if (href === null) {
        delete entityData.href
    }
    try {
        const nextContentState = contentState.createEntity('LINK', 'MUTABLE', entityData)
        let nextEditorState = EditorState.set(editorState, {
            currentContent: nextContentState
        })
        const entityKey = nextContentState.getLastCreatedEntityKey();
        nextEditorState = RichUtils.toggleLink(nextEditorState, selectionState, entityKey);
        nextEditorState = EditorState.forceSelection(nextEditorState, selectionState.merge({
            anchorOffset: selectionState.getEndOffset(), 
            focusOffset: selectionState.getEndOffset()
        }));

        nextEditorState = EditorState.push(
            nextEditorState, 
            Modifier.insertText(nextEditorState.getCurrentContent(), nextEditorState.getSelection(), ''), 
            'insert-text' as EditorChangeType
        )

        return nextEditorState

    } catch (error) {
        console.warn(error)
        return editorState
    }
}

type entityType = {
    type: string;
    data: { href: string, target: string, description: string };
    mutability: DraftEntityMutability;
}
export const insertText = (editorState: EditorState, text: string, inlineStyle: DraftInlineStyle|undefined, entity: entityType|undefined) => {
    const selectionState = editorState.getSelection()
    const currentSelectedBlockType = getSelectionBlockType(editorState)
  
    if (currentSelectedBlockType === 'atomic') {
      return editorState
    }
  
    let entityKey
    let contentState = editorState.getCurrentContent()

    if (entity && entity.type) {
      contentState = contentState.createEntity(entity.type, entity.mutability || 'MUTABLE', entity.data)
      entityKey = contentState.getLastCreatedEntityKey()
    }
  
    if (!selectionState.isCollapsed()) {
      return EditorState.push(editorState, Modifier.replaceText(contentState, selectionState, text, inlineStyle, entityKey), 'replace-text' as EditorChangeType)
    } else {
      return EditorState.push(editorState, Modifier.insertText(contentState, selectionState, text, inlineStyle, entityKey), 'insert-text' as EditorChangeType)
    } 
}

export const isSelectionCollapsed = (editorState: EditorState) => {
    return editorState.getSelection().isCollapsed()
}

export const getSelectionText = (editorState: EditorState) => {

    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
  
    if (selectionState.isCollapsed() || getSelectionBlockType(editorState) === 'atomic') {
      return ''
    }
  
    const anchorKey = selectionState.getAnchorKey()
    const currentContentBlock = contentState.getBlockForKey(anchorKey)
    const start = selectionState.getStartOffset()
    const end = selectionState.getEndOffset()
  
    return currentContentBlock.getText().slice(start, end) 
}

// 文本布局
export const toggleSelectionAlignment = (editorState: EditorState, alignment: string) => {
    return setSelectionBlockData(editorState,  Immutable.Map({
      textAlign: getSelectionBlockData(editorState, 'textAlign') !== alignment ? alignment : undefined
    }))
}

export const insertMedias = (editorState: EditorState, medias: any = []) => {
  if (!medias.length) {
    return editorState
  }
  return medias.reduce((editorState: EditorState, media: any) => {
    const { url, link, link_target, name, type, width, height, meta } = media
    return insertAtomicBlock(editorState, type, true, { url, link, link_target, name, type, width, height, meta })
  }, editorState)
}


export const insertAtomicBlock = (editorState: EditorState, type: string, immutable = true, data = {}): EditorState => {

  if (selectionContainsStrictBlock(editorState)) {
    return insertAtomicBlock(selectNextBlock(editorState, getSelectionBlock(editorState)), type, immutable, data)
  }

  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  if (!selectionState.isCollapsed() || getSelectionBlockType(editorState) === 'atomic') {
    return editorState
  }

  const contentStateWithEntity = contentState.createEntity(type, immutable ? 'IMMUTABLE' : 'MUTABLE', data)
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ')

  return newEditorState
}

export const selectNextBlock = (editorState: EditorState, block: ContentBlock) => {
  const nextBlock = editorState.getCurrentContent().getBlockAfter(block.getKey())
  return nextBlock ? selectBlock(editorState, nextBlock) : editorState
}

export const selectBlock = (editorState: EditorState, block: ContentBlock) => {

  const blockKey = block.getKey()

  return EditorState.forceSelection(editorState, new SelectionState({
    anchorKey: blockKey,
    anchorOffset: 0,
    focusKey: blockKey,
    focusOffset: block.getLength()
  }))
}

export const setMediaPosition = (editorState: EditorState, mediaBlock: ContentBlock, position: {float?: string; alignment?: string}) => {

  let newPosition = Immutable.Map({float: position.float, alignment: position.alignment});
  const { float, alignment } = position

  if (typeof float !== 'undefined') {
    newPosition.set('float', mediaBlock.getData().get('float') === float ? undefined : float); 
  }

  if (typeof alignment !== 'undefined') {
    newPosition.set('alignment', mediaBlock.getData().get('alignment') === alignment ? undefined : alignment); 
  }

  return setSelectionBlockData(selectBlock(editorState, mediaBlock), newPosition)
}

export const setMediaData = (editorState: EditorState, entityKey: string, data: {}) => {
  return EditorState.push(editorState, editorState.getCurrentContent().mergeEntityData(entityKey, data), 'change-block-data')
}