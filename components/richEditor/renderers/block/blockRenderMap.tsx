import React from 'react';
import { DefaultDraftBlockRenderMap } from 'draft-js';
import { Map } from 'immutable';

interface BlockRenderMapProps {
    
}
const BlockRenderMap = (props: BlockRenderMapProps, blockRenderMap?: Function) => {
    let customBlockRenderMap = Map({
        atomic: {
          element: '',
        },
        'code-block': {
          element: 'code',
          wrapper: <pre className="richEditor-code-pre" />
        },
    });

    if (blockRenderMap) {
        if (typeof blockRenderMap === 'function') {
          customBlockRenderMap = customBlockRenderMap.merge(
            blockRenderMap(props),
          );
        }
    }
    customBlockRenderMap = DefaultDraftBlockRenderMap.merge(
      customBlockRenderMap,
    );
    return customBlockRenderMap;
};
export default BlockRenderMap;