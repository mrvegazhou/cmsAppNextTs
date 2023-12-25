import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand} from 'lexical';
import {useEffect} from 'react';
import {$createVideoIframeNode, VideoIframeNode, SourceType} from '../../nodes/VideoIframeNode';

export const INSERT_VIDEOIFRAME_COMMAND: LexicalCommand<{src: string, srcType: SourceType}> = createCommand(
    'INSERT_VIDEOIFRAME_COMMAND',
);
  
export default function VideoIframePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
  
    useEffect(() => {
      if (!editor.hasNodes([VideoIframeNode])) {
        throw new Error('VideoIframePlugin: VideoIframeNode not registered on editor');
      }
  
      return editor.registerCommand<{src: string, srcType: SourceType}>(
        INSERT_VIDEOIFRAME_COMMAND,
        (payload) => {
          const videoIframeNode = $createVideoIframeNode(payload.src, payload.srcType);
          $insertNodeToNearestRoot(videoIframeNode);
        
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );
    }, [editor]);
  
    return null;
}