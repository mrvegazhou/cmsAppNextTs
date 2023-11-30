import React, { ElementRef } from "react";
import { 
    Editor,
    Modifier, 
    EditorState,
    DraftBlockType, 
    RichUtils, 
    EditorChangeType, 
    DraftEntityMutability,
    DraftInlineStyle,
    SelectionState,
    AtomicBlockUtils,
    ContentBlock,
    ContentState,
    convertToRaw,
    convertFromRaw,
    CharacterMetadata
} from 'draft-js'
// @ts-expect-error
import getContentStateFragment from "draft-js/lib/getContentStateFragment";
// @ts-expect-error
import getDraftEditorSelection from "draft-js/lib/getDraftEditorSelection";
import Immutable from 'immutable'
import { getSelectionEntity } from './inline'
import { AddImageProps, AddMediaProps } from '../interfaces'


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


export const updateEachCharacterOfSelection = (editorState: EditorState, callback: Function) => {

  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const contentBlocks = contentState.getBlockMap()
  const selectedBlocks = getSelectedBlocks(editorState)

  if (selectedBlocks.length === 0) {
    return editorState
  }

  const startKey = selectionState.getStartKey()
  const startOffset = selectionState.getStartOffset()
  const endKey = selectionState.getEndKey()
  const endOffset = selectionState.getEndOffset()

  const nextContentBlocks = contentBlocks.map((block) => {
    if (typeof block==='undefined') { return; }

    if (selectedBlocks.indexOf(block) === -1) {
      return block
    }

    const blockKey = block.getKey()
    const charactersList = block.getCharacterList()
    let nextCharactersList = null

    if (blockKey === startKey && blockKey === endKey) {
      nextCharactersList = charactersList.map((character, index) => {
        // @ts-ignore
        if (index >= startOffset && index < endOffset) {
          return callback(character)
        }
        return character
      })
    } else if (blockKey === startKey) {
      nextCharactersList = charactersList.map((character, index) => {
        // @ts-ignore
        if (index >= startOffset) {
          return callback(character)
        }
        return character
      })
    } else if (blockKey === endKey) {
      nextCharactersList = charactersList.map((character, index) => {
        // @ts-ignore
        if (index < endOffset) {
          return callback(character)
        }
        return character
      })
    } else {
      nextCharactersList = charactersList.map((character) => {
        return callback(character)
      })
    }

    return block.merge({
      'characterList': nextCharactersList
    })

  })

  return EditorState.push(editorState, contentState.merge({
    blockMap: nextContentBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState
  }) as ContentState, 'update-selection-character-list' as EditorChangeType)

}

export const toggleSelectionInlineStyle = (editorState: EditorState, style: string, prefix: string = '') => {
  let nextEditorState = editorState
  style = prefix + style.toUpperCase()

  if (prefix) {

    nextEditorState = updateEachCharacterOfSelection(nextEditorState, (characterMetadata: CharacterMetadata) => {

      // @ts-ignore
      return characterMetadata.toJS().style.reduce((characterMetadata, characterStyle) => {
        if (characterStyle.indexOf(prefix) === 0 && style !== characterStyle) {
          return CharacterMetadata.removeStyle(characterMetadata, characterStyle)
        } else {
          return characterMetadata
        }
      }, characterMetadata)

    })

  }

  return RichUtils.toggleInlineStyle(nextEditorState, style)
}

export const toggleSelectionColor = (editorState: EditorState, color: string) => {
  return toggleSelectionInlineStyle(editorState, color.replace('#', ''), 'COLOR-')
}

export const toggleSelectionFontSize = (editorState: EditorState, fontSize: string) => {
  return toggleSelectionInlineStyle(editorState, fontSize, 'FONTSIZE-')
}

export const toggleSelectionBackgroundColor = (editorState: EditorState, color: string) => {
  return toggleSelectionInlineStyle(editorState, color.replace('#', ''), 'BGCOLOR-')
}

export const toggleSelectionFontFamily = (editorState: EditorState, fontFamily: string) => {
  return toggleSelectionInlineStyle(editorState, fontFamily, 'FONTFAMILY-')
}

export const toggleSelectionWordSpace = (editorState: EditorState, wordSpace: string) => {
  return toggleSelectionInlineStyle(editorState, wordSpace, 'WORDSPACE-')
}

export const toggleSelectionLineHeight = (editorState: EditorState, lineHeight: string) => {
  return toggleSelectionInlineStyle(editorState,  lineHeight, 'LINEHEIGHT-')
}

export const selectionHasInlineStyle = (editorState: EditorState, style: string) => {
  return editorState.getCurrentInlineStyle().has(style.toUpperCase())
}

export const getSelectionEntityData = (editorState: EditorState, type: string) => {

    const entityKey = getSelectionEntity(editorState)
    if (entityKey) {
      const entity = editorState.getCurrentContent().getEntity(entityKey);
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
export const insertText = (editorState: EditorState, text: string, inlineStyle?: DraftInlineStyle, entity?: entityType) => {
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

export const insertMedias = (editorState: EditorState, medias: AddMediaProps[]) => {
  if (!medias.length) {
    return editorState
  }
  return medias.reduce((editorState: EditorState, media: any) => {
    const { url, linkTarget, type, width, height, description } = media
    return insertAtomicBlock(editorState, type, true, { url, linkTarget, type, width, height, description })
  }, editorState)
}


export const insertAtomicBlock = (editorState: EditorState, type: string, immutable:boolean = true, data:AddMediaProps): EditorState => {

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

export const insertImage = (editorState: EditorState, data: AddImageProps) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', data);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
  return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
};

// Get clipboard content from the selection like Draft.js would.
export const getSelectedContent = (
  editorState: EditorState,
  editorRoot: HTMLElement,
) => {
  const { selectionState } = getDraftEditorSelection(editorState, editorRoot);

  const fragment = getContentStateFragment(
    editorState.getCurrentContent(),
    selectionState,
  );

  // If the selection contains no content (according to Draft.js), use the default browser behavior.
  // This happens when selecting text that's within contenteditable=false blocks in Draft.js.
  // See https://github.com/thibaudcolas/draftjs-conductor/issues/12.
  const isEmpty = fragment.every((block: ContentBlock) => {
    return block.getText().length === 0;
  });

  return isEmpty ? null : fragment;
};

// Overrides the default copy/cut behavior, adding the serialised Draft.js content to the clipboard data.
// See also https://github.com/basecamp/trix/blob/62145978f352b8d971cf009882ba06ca91a16292/src/trix/controllers/input_controller.coffee#L415-L422
// We serialise the editor content within HTML, not as a separate mime type, because Draft.js only allows access
// to HTML in its paste event handler.
const FRAGMENT_ATTR = "data-draftjs-conductor-fragment";
export const draftEditorCopyCutListener = (
  // @ts-expect-error
  ref: ElementRef<Editor>,
  e: React.ClipboardEvent,
) => {
  const selection = window.getSelection() as Selection;

  // Completely skip event handling if clipboardData is not supported (IE11 is out).
  // Also skip if there is no selection ranges.
  // Or if the selection is fully within a decorator.
  if (
    !e.clipboardData ||
    selection.rangeCount === 0 ||
    isSelectionInDecorator(selection)
  ) {
    return;
  }
  // @ts-expect-error
  const fragment = getSelectedContent(ref._latestEditorState, ref.editor);

  // Override the default behavior if there is selected content.
  if (fragment) {
    const content = ContentState.createFromBlockArray(fragment.toArray());
    const serialisedContent = JSON.stringify(convertToRaw(content));

    // Create a temporary element to store the selection’s HTML.
    // See also Rangy's implementation: https://github.com/timdown/rangy/blob/1e55169d2e4d1d9458c2a87119addf47a8265276/src/core/domrange.js#L515-L520.
    const fragmentElt = document.createElement("div");
    // Modern browsers only support a single range.
    fragmentElt.appendChild(selection.getRangeAt(0).cloneContents());
    fragmentElt.setAttribute(FRAGMENT_ATTR, serialisedContent);
    // We set the style property to replicate the browser's behavior of inline styles in rich text copy-paste.
    // In Draft.js, this is important for line breaks to be interpreted correctly when pasted into another word processor.
    // See https://github.com/facebook/draft-js/blob/a1f4593d8fa949954053e5d5840d33ce1d1082c6/src/component/base/DraftEditor.react.js#L328.
    fragmentElt.setAttribute("style", "white-space: pre-wrap;");

    e.clipboardData.setData("text/plain", selection.toString());
    e.clipboardData.setData("text/html", fragmentElt.outerHTML);

    e.preventDefault();
  }
};

// Checks whether the selection is inside a decorator or not.
// This is important to change the copy-cut behavior accordingly.
const DRAFT_DECORATOR = '[data-contents="true"] [contenteditable="false"]';
const isSelectionInDecorator = (selection: Selection) => {
  const { anchorNode, focusNode } = selection;
  if (!anchorNode || !focusNode) {
    return false;
  }

  const anchor =
    anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
  const focus =
    focusNode instanceof Element ? focusNode : focusNode.parentElement;

  const anchorDecorator = anchor && anchor.closest(DRAFT_DECORATOR);
  const focusDecorator = focus && focus.closest(DRAFT_DECORATOR);

  return (
    anchorDecorator &&
    focusDecorator &&
    (anchorDecorator.contains(focusDecorator) ||
      focusDecorator.contains(anchorDecorator))
  );
};

/**
 * Returns pasted content coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 */
export const getDraftEditorPastedContent = (html: string | undefined) => {
  // Plain-text pastes are better handled by Draft.js.
  if (html === "" || typeof html === "undefined" || html === null) {
    return null;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragmentElt = doc.querySelector(`[${FRAGMENT_ATTR}]`);

  // Handle the paste if it comes from draftjs-conductor.
  if (fragmentElt) {
    const fragmentAttr = fragmentElt.getAttribute(FRAGMENT_ATTR);
    let rawContent;

    try {
      // If JSON parsing fails, leave paste handling to Draft.js.
      // There is no reason for this to happen, unless the clipboard was altered somehow.
      // @ts-expect-error
      rawContent = JSON.parse(fragmentAttr);
    } catch (error) {
      return null;
    }

    return convertFromRaw(rawContent);
  }

  return null;
};
