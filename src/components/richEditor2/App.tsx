
import {forwardRef, Suspense, useCallback} from 'react';
import {$getRoot} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import Editor from './Editor';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import {SharedAutocompleteContext} from './context/SharedAutocompleteContext';
import {TableContext} from './plugins/TablePlugin';
import {SettingsContext, useSettings} from './context/SettingsContext';
import AppNodes from './nodes/AppNodes';
import PlaygroundEditorTheme from './themes/CmsEditorTheme';
import { SkeletonLayout } from "@/components/skeleton/layout";
import "./index.scss";
import { TMetadata } from '@/types';

function prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
    
    }
}

interface propsType {
  metadata: TMetadata;
}

const App = forwardRef((prop: propsType, ref): JSX.Element => {
    const {
        settings: {isCollab, emptyEditor},
    } = useSettings();

    const initialConfig = {
        editorState: isCollab
          ? null
          : emptyEditor
          ? undefined
          : prepopulatedRichText,
        namespace: 'AppEditor',
        nodes: [...AppNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
    };

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
                    <Editor metadata={prop.metadata}/>
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