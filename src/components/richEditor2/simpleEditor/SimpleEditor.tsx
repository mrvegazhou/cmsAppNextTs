import * as React from 'react';
import {useRef, useState, forwardRef, useImperativeHandle, MutableRefObject} from 'react';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {useSharedHistoryContext} from '../context/SharedHistoryContext';

import { useClickAway } from 'ahooks';

// plugins
import {MaxLengthPlugin} from '../plugins/MaxLengthPlugin';
import ImagesPlugin from '../plugins/ImagesPlugin';
import LinkPlugin from '../plugins/LinkPlugin';
import MentionsPlugin from '../plugins/MentionsPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';

// ui
import Placeholder from '../ui/Placeholder';
import ContentEditable from '../ui/ContentEditable';
import classNames from 'classnames';

import type { TMetadata } from '@/types';
import { IPostTypeVal } from '@/interfaces';
import styles from './SimpleEditor.module.scss';
import ToolBar from './toolBar';
import { COMMENT_WORDS_LIMIT } from '@/lib/constant';

interface propsType {
  metadata?: TMetadata | null;
  cls?: string;
  showToolBar?: boolean;
  emojisplacement?: string;
  placeholderText?: string;
  extraData?: IPostTypeVal;
}
const SimpleEditor = forwardRef((props: propsType, ref): JSX.Element => {
    const {historyState} = useSharedHistoryContext();
    const [editor] = useLexicalComposerContext();
    const isEditable = useLexicalEditable();

    const focusEditor = () => {
        if (isEditable) {
            editor._rootElement?.focus();
        }
    };

    useImperativeHandle(ref, () => ({
        focusEditor
    }));
    
    const text = props.placeholderText ?? "文明发言";
    const placeholder = <Placeholder className={styles.placeholder}>{text}</Placeholder>;

    const [showToolBar, setShowToolBar] = useState<boolean>(props.showToolBar??true);
    const simpleRef = useRef(null);

    useClickAway(() => {
        setShowToolBar(false);
    }, [simpleRef, document.getElementById('hideCommentEmoji')]);

    return (
        <>
            <style jsx>{`
                .hidden {
                    display: none;
                }
            `}</style>
            <div className={classNames(styles.simpleDiv, props.cls)} id="simpleEditorContainer" onClick={()=>{setShowToolBar(true)}} ref={simpleRef}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className={styles.simpleEditor} />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    placeholder={placeholder}
                />
                <ToolBar cls={classNames(showToolBar ? '' : 'd-none')} 
                    emojisplacement={props.emojisplacement}
                    extraData={props.extraData}
                />
                <MaxLengthPlugin maxLength={COMMENT_WORDS_LIMIT} />
                <ImagesPlugin />
                {/* 链接 */}
                <LinkPlugin />
                {/* @提示 */}
                <MentionsPlugin />
                <ClearEditorPlugin />
                <HistoryPlugin externalHistoryState={historyState} />
            </div>
        </>
    );
});
SimpleEditor.displayName = 'SimpleEditor';
export default SimpleEditor;
