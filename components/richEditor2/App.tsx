
import {useRef, forwardRef, useImperativeHandle, Suspense, useCallback} from 'react';
import {$getRoot} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import Editor from './Editor';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import {SharedAutocompleteContext} from './context/SharedAutocompleteContext';
import {TableContext} from './plugins/TablePlugin';
import {SettingsContext, useSettings} from './context/SettingsContext';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { SkeletonLayout } from "@/components/skeleton/layout";
import "./index.scss";

function prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
    
    }
}

const App = forwardRef((prop, ref): JSX.Element => {
    const {
        settings: {isCollab, emptyEditor, measureTypingPerf},
      } = useSettings();

    const initialConfig = {
        editorState: isCollab
          ? null
          : emptyEditor
          ? undefined
          : prepopulatedRichText,
        namespace: 'Playground',
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
    };

    const editorRef = useRef(null);
    const showClear = () => {
      // @ts-ignore
      editorRef.current && editorRef.current.showClear();
    };

    useImperativeHandle(ref, () => ({
      // @ts-ignore
      handleSave2Html: editorRef.current && editorRef.current.handleSave2Html
    }))

    const Loading = useCallback((): JSX.Element => {
      return <SkeletonLayout
                align="center"
                items={[
                  { height: 20, width: '90%', marginBottom: 30 },
                  { height: 20, width: '90%', marginBottom: 30 },
                  { height: 20, width: '90%', marginBottom: 30 },
                  { height: 20, width: '90%', marginBottom: 30 },
                  { height: 20, width: '90%', marginBottom: 30 },
                ]}
              />
    }, []);

    return (
      <Suspense fallback={<Loading />}>
        <SettingsContext>
          <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
              <TableContext>
                <SharedAutocompleteContext>

                  <div className="editor-shell">
                    <Editor ref={editorRef} />
                  </div>
                  
                </SharedAutocompleteContext>
              </TableContext>
            </SharedHistoryContext>
          </LexicalComposer>
        </SettingsContext>
      </Suspense>
    );
});
App.displayName = 'EditorApp';
export default App;