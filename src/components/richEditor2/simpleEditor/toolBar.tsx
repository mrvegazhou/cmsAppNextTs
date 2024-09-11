import { useEffect, useCallback, useState, forwardRef, useRef } from 'react';
import classNames from 'classnames';
import {$getRoot, $getSelection, CLEAR_EDITOR_COMMAND} from 'lexical';
import type {LexicalNode} from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { filterEmptyNodes, visitTree } from '../utils/node';
import { $isImageNode } from '../nodes/ImageNode';
import { useTranslations } from 'next-intl';
import PopoverComp from "@/components/popover/popover";
import {InsertImageDialog} from '../plugins/ImagesPlugin';
import useModal from '@/hooks/useModal/show';
import Emojis from './emojis';
import { commentListAtom, emojisAtom } from "@/store/comment";
import { useAtomValue, useSetAtom } from 'jotai';
import { useMutation } from '@tanstack/react-query';
import { CharCounter, handleDrop } from '@/lib/tool';
import { COMMENT_WORDS_LIMIT, COMMENT_IMGS_LIMIT } from '@/lib/constant';
import useToast from '@/hooks/useToast';
import type { TBody } from '@/types';
import { IArticleComment, IComment, ICommentList, ICommentReq, IReplyReq, IData, IArticleReply } from '@/interfaces';
import { saveArticleComment, saveArticleReply } from '@/services/api/comment';
import { currentArticleDataAtom } from '@/store/articleData';
import { userDataAtom } from '@/store/userData';
import { loginAtom } from '@/store/userData';
import { useAtom } from 'jotai';
import styles from './toolBar.module.scss';
import { isNullAndUnDef } from '@/lib/is';
import { postTypeValAtom } from '@/store/editorPost';
import { containsImgTag } from '@/lib/stringTool';


interface propsType {
    cls?: string;
}
const Toolbar = forwardRef<HTMLDivElement, propsType>((props, ref) => {
    const [islogin, setLoginModal] = useAtom(loginAtom);
    const articleInfo = useAtomValue(currentArticleDataAtom);
    const userData = useAtomValue(userDataAtom);
    const setCommentList = useSetAtom(commentListAtom);
    // 判断post类型
    const postTypeVal = useAtomValue(postTypeValAtom);
 

    const { show } = useToast();
    const [editor] = useLexicalComposerContext();
    const emojisRecentlyUsed = useAtomValue(emojisAtom);
    const [isDisabled, setIsDisabled] = useState(false);

    const t = useTranslations('ArticleComment');
    const [modal, showModal] = useModal();
    const selfToolBarRef = useRef(null);

    const [imgNodeCount, setImgNodeCount] = useState(0);

    const showImage = useCallback((e: React.MouseEvent<Element>) => {
        if (imgNodeCount>COMMENT_IMGS_LIMIT) {
            show({type: 'DANGER', message: t('commentImgsLimit')});
            return;
        }
        showModal(t('insertImage'), (onClose) => (
            <InsertImageDialog
              activeEditor={editor}
              onClose={onClose}
              resizable={false}
              type='comment'
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

    const saveCommentMutation = useMutation({
        mutationFn: async (variables: TBody<ICommentReq>) => {
            return (await saveArticleComment(variables)) as IData<IArticleComment>;
        },
    });

    const saveReplyMutation = useMutation({
        mutationFn: async (variables: TBody<IReplyReq>) => {
            return (await saveArticleReply(variables)) as IData<IArticleReply>;
        },
    });

    useEffect(() => {

    }, []);

    // 提交评论
    const submitComment = () => {
        if (JSON.stringify(userData)==='{}' || isNullAndUnDef(userData)) {
            show({type: 'DANGER', message: t('notLogged')});
            setLoginModal(true);
            return;
        }
        const articleId = articleInfo.id;
        if (articleId==0 || isNullAndUnDef(articleId) ) {
            show({type: 'DANGER', message: t('articleIdErr')});
            return;
        }
        let htmlContent = '';
        editor.update(() => {
            // 去除空格
            const editorState = editor.getEditorState();
            const nodes = Array.from(editorState._nodeMap);
            filterEmptyNodes(nodes);
            filterEmptyNodes(nodes.reverse());

            const root = $getRoot();
            
            htmlContent = $generateHtmlFromNodes(editor, null);
            if (htmlContent=="") {
                show({type: 'DANGER', message: t('commentIsEmpty')});
                return;
            }
            let texts = root.getTextContent();

            // 判断字符串是否包含<img>标签
            if (containsImgTag(htmlContent)) {
                let cleanedContent = htmlContent.replace(/<br\s*\/?>/g, '\n');
                cleanedContent = cleanedContent.replace(/<(?!(?:\/?img)[^>]*>)[^>]*>/g, '');
                // 使用正则表达式匹配 img 标签并修改 src 属性
                const imgTagRegex = /<img ([^>]*)src="([^"]+)"([^>]*>)/gi;
                cleanedContent = cleanedContent.replace(imgTagRegex, (match, preSrc, src, postSrc) => {
                    // 替换 src 中的 'p/' 为空字符串
                    const modifiedSrc = src.replace('/p/', '/');
                    return `<img ${preSrc}src="${modifiedSrc}"${postSrc}`;
                });
                htmlContent = cleanedContent;
            } else {
                htmlContent = texts;
            }
            
            let nums = CharCounter(texts)
            if (nums>COMMENT_WORDS_LIMIT) {
                show({type: 'DANGER', message: t('commentWordsLimit')});
                return;
            }
            if (imgNodeCount>1) {
                show({type: 'DANGER', message: t('commentImgsLimit')});
                return;
            }

        }, {discrete: true});

        let mutationTemp;
        if (postTypeVal.type==="comment") {
            let data = {
                userId: userData.id,
                articleId: articleId,
                content: htmlContent
            } as ICommentReq;
            mutationTemp = saveCommentMutation.mutateAsync({
                data: data
            });
        } else if (postTypeVal.type==="reply") {
            let data = {
                userId: userData.id,
                articleId: articleId,
                content: htmlContent,
                commentId: postTypeVal.pid
            } as IReplyReq;
            mutationTemp = saveReplyMutation.mutateAsync({
                data: data
            });
        } else {
            return;
        }
        mutationTemp!.then(res => {
            if (res.status == 200) {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                show({ type: 'SUCCESS', message: t('saveCommentSuccess') });
                if (postTypeVal.type==="comment") {
                    let commentInfo: ICommentList = {} as ICommentList;
                    let data = res.data as IComment;
                    commentInfo = Object.assign({}, {comment:data, replies: []});
                    setCommentList(prev => {
                        return [commentInfo, ...prev]
                    });
                } else if (postTypeVal.type==="reply") {
                    let replyInfo = res.data as IArticleReply;
                    setCommentList(prev => {
                        let newCommentList = [];
                        for (let item of prev) {
                            if (item.comment.id==replyInfo.commentId) {
                                if (item.replies==null) {
                                    item.replies = [];
                                }
                                let replies = [replyInfo, ...item.replies];
                                console.log(replyInfo, replies, '----')
                                ++item.comment.replyCount;
                                newCommentList.push({comment: item.comment, replies: replies});
                            } else {
                                newCommentList.push(item);
                            }
                        }
                        return newCommentList;
                    });
                }
                
            } else {
                show({ type: 'DANGER', message: t('saveCommentErr') });
                setIsDisabled(false);
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            setIsDisabled(false);
            return;
        });
    };

    useEffect(() => {
        return editor.registerUpdateListener(({editorState}) => {
            editorState.read(() => {
                const root = $getRoot();
                let imgCount = 0;
                visitTree(root, (node: LexicalNode) => {
                    if ($isImageNode(node)) {
                        imgCount++;
                    }
                });
                setImgNodeCount(imgCount);
                if (imgCount>1) {
                    show({type: 'DANGER', message: t('commentImgsLimit')});
                    return;
                }
            });
        })
    }, [editor]);

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
                <div className={styles.emojiList}>
                    {emojisRecentlyUsed.map((emoji, index) => (
                        <span className={styles.recentEmojis} key={index} onClick={(e) => insertEmoji(e, emoji)}>{emoji}</span>
                    ))}
                </div>
            </div>
            <div className={styles.submit}>
                <span className={styles.gap}></span>
                <button type="button" disabled={isDisabled} onClick={submitComment} className="btn-sm btn btn-outline-primary">{t('submit')}</button>
            </div>
            {/* 弹出框 */}
            {modal}
        </div>
    );
});
Toolbar.displayName = 'Toolbar';
export default Toolbar;