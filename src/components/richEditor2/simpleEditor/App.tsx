
import { forwardRef, Suspense, useCallback, useImperativeHandle, useRef, useState, MutableRefObject } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import Editor from './SimpleEditor';
import PlaygroundEditorTheme from '../themes/CmsEditorTheme';
import { SkeletonLayout } from "@/components/skeleton/layout";
import { SimpleAppNodes } from '../nodes/AppNodes';
import { IPostTypeVal } from '@/interfaces';

interface propsType {
  cls?: string;
  showToolBar?: boolean;
  emojisplacement?: string;
  placeholderText?: string;
  extraData?: IPostTypeVal;
}
const App = forwardRef((props: propsType, ref): JSX.Element => {

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

  const [cls, setCls] = useState(props.cls);
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
        <Editor metadata={null} ref={simpleEditorRef} cls={cls} 
          showToolBar={props.showToolBar} 
          emojisplacement={props.emojisplacement}
          placeholderText={props.placeholderText}
          extraData={props.extraData}
        />
      </LexicalComposer>
    </Suspense>
  );
});
App.displayName = 'simpleEditorApp';
export default App;