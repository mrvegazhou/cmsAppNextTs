import React from 'react'
import { ContentState, ContentBlock } from 'draft-js';
import { ImageBlock } from '../image/image';
import DividerBlock from '../divider/divider';

type MediaBlockProps = {
    contentState: ContentState;
    block: ContentBlock;
    blockProps: {deleteImage:(block: ContentBlock)=>void}
}
const MediaBlock = (props: MediaBlockProps) => {

    const { contentState, block } = props;
    if (!block.getEntityAt(0)) return null;

    const entity = contentState.getEntity(block.getEntityAt(0));
    const type = entity.getType();
    const { src, description, fileName, width, height } = entity.getData();

    if (type === 'image') {
        return (
          <ImageBlock 
                url={src} 
                description={description}
                deleteImage={() => {
                    props.blockProps.deleteImage(props.block);
                }}
                width={width}
                height={height}
                fileName={fileName}
            />
        )
    } else if (type === 'video') {
        return (
          <div>This is a Video</div>
        )
    } else if (type === 'Divider') {
        return (
            <DividerBlock />
        )
    }
};

export default MediaBlock;

