import React from 'react';
import { DefaultDraftBlockRenderMap, EditorState } from 'draft-js';
import { Map } from 'immutable';
import TableRenderer from '../../components/table/tableRender';
// 代码块
// import { CodeBlockWrapper, syntaxs } from '../../components/codeHighLighter';

interface BlockRenderMapProps {
  editorState: EditorState;
  readOnly?: boolean;
  onChange: Function;
  requestBlur?: Function;
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
        // 代码
        // 'code-block': {
        //   element: 'code',
        //   wrapper: <CodeBlockWrapper syntaxs={syntaxs} editorState={props.editorState} onChange={props.onChange} showLineNumber={true} />,
        // },
        'table-cell': {
          element: 'td',
          wrapper: <TableRenderer columnResizable={true} readOnly={props.readOnly ?? true} requestBlur={props.requestBlur} editorState={props.editorState} onChange={props.onChange} />
        }
    });

    if (blockRenderMap) {
        if (typeof blockRenderMap === 'function') {
          customBlockRenderMap = customBlockRenderMap.merge(
            blockRenderMap(props),
          );
        } else {
          customBlockRenderMap = customBlockRenderMap.merge(blockRenderMap);
        }
    }
    customBlockRenderMap = DefaultDraftBlockRenderMap.merge(
      customBlockRenderMap,
    );
    return customBlockRenderMap;
};
export default BlockRenderMap;