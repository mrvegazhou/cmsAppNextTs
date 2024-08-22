import { useEffect, useCallback, useState, forwardRef, useRef } from 'react';
import classNames from 'classnames';
import {$getRoot, $getSelection} from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { useTranslations } from 'next-intl';
import PopoverComp from "@/components/popover/popover";
import {InsertImageDialog} from '../plugins/ImagesPlugin';
import useModal from '@/hooks/useModal/show';
import Emojis from './emojis';
import { emojisAtom } from "@/store/comment";
import styles from './toolBar.module.scss';
import { useAtomValue } from 'jotai';
import { handleDrop } from '@/lib/tool';


interface propsType {
    cls?: string;
}
const Toolbar = forwardRef<HTMLDivElement, propsType>((props, ref) => {

    const [editor] = useLexicalComposerContext();
    const emojisRecentlyUsed = useAtomValue(emojisAtom);
    const [disabled, setDisabled] = useState(false);

    const t = useTranslations('ArticleComment');
    const [modal, showModal] = useModal();
    const selfToolBarRef = useRef(null);

    const showImage = useCallback((e: React.MouseEvent<Element>) => {
        showModal(t('insertImage'), (onClose) => (
            <InsertImageDialog
              activeEditor={editor}
              onClose={onClose}
              resizable={false}
            />
        ), 810, 'zIndex', {container: selfToolBarRef.current!}); // zIndex是class name
        handleDrop(e);
    }, [editor]);

    const insertEmoji = useCallback((e: React.MouseEvent<Element>, emoji: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if (selection) {
              selection.insertText(emoji);
            }
        }, {discrete: true});
        handleDrop(e);
    }, [editor]);

    const content = (
        <Emojis insertEmoji={insertEmoji} />
    );

    // 提交评论
    const submitComment = () => {
        editor.update(() => {
            let content = $generateHtmlFromNodes(editor, null);
            
        }, {discrete: true});
    };

    return (
        <div className={classNames(styles.toolBar, props.cls)} ref={selfToolBarRef}>
            <div className={styles.imgEmoji}>
                <div></div>
                <button type="button" className={styles.btn} onClick={(e) => showImage(e)}>
                    <i className='iconfont icon-ic_image_upload' />
                </button>
                <button type="button" className={styles.btn}>
                    <PopoverComp trigger="click" placement="bottom" usePortal={false} content={content} zIndex="9999">
                        <i className='iconfont icon-biaoqingemoji' />
                    </PopoverComp>
                </button>
                
                <div className='d-flex justify-content-between align-items-center align-centent-center h-50'>
                    <div className="vr"></div>
                </div>
                <div className={styles.emojiList} style={{marginLeft: '4px'}}>
                    {emojisRecentlyUsed.map((emoji, index) => (
                        <span className={styles.recentEmojis} key={index} onClick={(e) => insertEmoji(e, emoji)}>{emoji}</span>
                    ))}
                </div>
            </div>
            <div className={styles.submit}>
                <span className={styles.gap}></span>
                <button type="button" disabled={disabled} onClick={submitComment} className="btn-sm btn btn-outline-primary">{t('submit')}</button>
            </div>
            {/* 弹出框 */}
            {modal}
        </div>
    );
});
Toolbar.displayName = 'Toolbar';
export default Toolbar;