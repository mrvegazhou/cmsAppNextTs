import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { useLocalStorageState } from 'ahooks';
import * as React from 'react';
import type {EditorState} from 'lexical';

export const RestoreFromLocalPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [serializedEditorState, setSerializedEditorState] = useLocalStorageState<string | undefined>(
    'use-local-storage-state-demo1',
    {defaultValue:''}
  );
  const [isFirstRender, setIsFirstRender] = React.useState(true)

  React.useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)

      if (serializedEditorState) {
        const initialEditorState = editor.parseEditorState(serializedEditorState)
        editor.setEditorState(initialEditorState)
      }
    }
  }, [isFirstRender, serializedEditorState, editor])

  const onChange = React.useCallback(
    (editorState: EditorState) => {
      setSerializedEditorState(JSON.stringify(editorState.toJSON()))
    },
    [setSerializedEditorState]
  )

  // TODO: add ignoreSelectionChange
  // @ts-ignore
  return (<OnChangePlugin onChange={onChange} />);
}