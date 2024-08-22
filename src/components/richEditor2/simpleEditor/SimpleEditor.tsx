import * as React from 'react';
import {useRef, useState, forwardRef, useImperativeHandle} from 'react';

import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';

import { useClickAway } from 'ahooks';

// plugins
import {MaxLengthPlugin} from '../plugins/MaxLengthPlugin';
import ImagesPlugin from '../plugins/ImagesPlugin';
import LinkPlugin from '../plugins/LinkPlugin';
import MentionsPlugin from '../plugins/MentionsPlugin';

// ui
import Placeholder from '../ui/Placeholder';
import ContentEditable from '../ui/ContentEditable';
import classNames from 'classnames';

import { useMutation } from '@tanstack/react-query';
import type { TBody, TMetadata } from '@/types';

import { useAtom, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { staticRouter } from '@/lib/constant/router';
import { goBackAtom } from '@/store/userData';
import { GetCurrentUrl } from '@/lib/tool';

import styles from './SimpleEditor.module.scss';
import ToolBar from './toolBar';


interface propsType {
  metadata: TMetadata | null;
  cls?: string;
}
const SimpleEditor = forwardRef((prop: propsType, ref): JSX.Element => {

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
    
    const text = "文明发言";
    const placeholder = <Placeholder className={styles.placeholder}>{text}</Placeholder>;

    const [showToolBar, setShowToolBar] = useState<boolean>(true);
    const simpleRef = useRef(null);
    // const toolBarRef = document.getElementById('w-modal');
    useClickAway(() => {
        setShowToolBar(false);
    }, [simpleRef]);

    return (
        <>
            <style jsx>{`
                .hidden {
                    display: none;
                }
            `}</style>
            <div className={classNames(styles.simpleDiv, prop.cls)} onClick={()=>{setShowToolBar(true)}} ref={simpleRef}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className={styles.simpleEditor} />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    placeholder={placeholder}
                />
                <ToolBar cls={classNames(showToolBar ? '' : 'd-none')} />
                <MaxLengthPlugin maxLength={1500} />
                <ImagesPlugin />
                {/* 链接 */}
                <LinkPlugin />
                {/* @提示 */}
                <MentionsPlugin />
                <ClearEditorPlugin />
            </div>
            
        </>
    );
});
SimpleEditor.displayName = 'SimpleEditor';
export default SimpleEditor;
