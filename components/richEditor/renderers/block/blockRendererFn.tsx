import React from 'react';
import ImageRenderer from '../../components/image/imageRender';
import DividerBlock from '../../components/divider/divider';
import { ContentBlock, ContentState, EditorState } from 'draft-js';

type OptionsProps = {
    onChange: Function; 
    editorState: EditorState;
    handleReadOnly: Function;
    forceRender: Function;
    containerNode?: Element;
}
type BlockRenderFnProps = {
    contentBlock: ContentBlock;
    containerNode: Element;
    blockProps?: OptionsProps;
}
type MediaBlockProps = {
    contentState: ContentState;
    block: ContentBlock;
    blockProps: OptionsProps;
}
const BlockRenderFn = (props: BlockRenderFnProps) => {

    const renderAtomicBlock = (props: MediaBlockProps) => {
        const { block, contentState, blockProps } = props;
        const { containerNode, onChange, editorState, handleReadOnly, forceRender } = blockProps;
        const entityKey = block.getEntityAt(0);
        if (!entityKey) {
            return null;
        }
        const entity = contentState.getEntity(entityKey);
        const mediaData = entity.getData();
        const mediaType = entity.getType();

        if (mediaType === 'IMAGE') {
            return <ImageRenderer block={block} forceRender={forceRender} handleReadOnly={handleReadOnly} mediaData={mediaData} containerNode={containerNode!} editorState={editorState} onChange={onChange}/>
        } else if (mediaType === 'Divider') {
            return <DividerBlock />
        } else if (mediaType === 'AUDIO') {
            // return <Audio {...mediaProps} />;
        } else if (mediaType === 'VIDEO') {
            // return <Video {...mediaProps} />;
        } else if (mediaType === 'EMBED') {
            // return <Embed {...mediaProps} />;
        }
    };

    const blockRendererFn = (contentBlock: ContentBlock, containerNode: Element, options?: OptionsProps) => {
        const blockType = contentBlock.getType();
        if (blockType === 'atomic') {
            return {
              component: renderAtomicBlock,
              editable: false,
              props: {
                containerNode: containerNode,
                onChange: options!.onChange,
                editorState: options!.editorState,
                handleReadOnly: options!.handleReadOnly,
                forceRender: options!.forceRender
              }
            };
        }
        return null;      
    };

    return blockRendererFn(props.contentBlock, props.containerNode, props.blockProps);
}

export default BlockRenderFn;
