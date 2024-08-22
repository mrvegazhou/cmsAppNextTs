
import { forwardRef, Suspense, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import Editor from './SimpleEditor';
import PlaygroundEditorTheme from '../themes/CmsEditorTheme';
import { SkeletonLayout } from "@/components/skeleton/layout";
import { SimpleAppNodes } from '../nodes/AppNodes';

interface propsType {
  cls?: string;
}
const App = forwardRef((prop: propsType, ref): JSX.Element => {

  const initialConfig = {
    editorState: null,
    namespace: 'AppSimpleEditor',
    nodes: [...SimpleAppNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const simpleEditorRef = useRef(null);
  const focusEditor = () => {
    // @ts-ignore
    if (simpleEditorRef.current && simpleEditorRef.current.focusEditor) {
      // @ts-ignore
      simpleEditorRef.current.focusEditor();
    }
  };

  const [cls, setCls] = useState(prop.cls);
  const changeCls = (cls: string) => {
    setCls(cls);
  };
  const getCls = () => {
    return cls;
  };
  useImperativeHandle(ref, () => ({
    focusEditor,
    changeCls,
    getCls
  }));


  const Loading = useCallback((): JSX.Element => {
    return <SkeletonLayout
      align="center"
      items={[
        { height: 20, width: '90%', marginBottom: 30 },
        { height: 20, width: '90%', marginBottom: 30 },
      ]}
    />
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <LexicalComposer initialConfig={initialConfig}>
        <Editor metadata={null} ref={simpleEditorRef} cls={cls} />
      </LexicalComposer>
    </Suspense>
  );
});
App.displayName = 'simpleEditorApp';
export default App;