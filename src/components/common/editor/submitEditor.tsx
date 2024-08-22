"use client";
import { forwardRef, useCallback, useState, useImperativeHandle, useEffect } from "react";
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { useAtom, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { writeArticleAtom } from "@/store/articleData";
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import type { TBody, TMetadata } from '@/types';
import type { IData, IArticleDraft, IArticle } from '@/interfaces';
import { saveArticleDraft, saveArticle } from "@/services/api";
import { getUserAgent } from "@/lib/tool";
import { debounce } from "lodash-es"
import {writeArticleNoteAtom } from '@/store/articleData';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { CLIENT_TPYES } from "@/lib/constant";
import { Comments } from "@/store/articleData";
import { saveMarkTag, replaceSpan } from "@/components/richEditor2/utils/node";
import { staticRouter } from "@/lib/constant/router";
import { metadataAtom } from "@/store/settingData";


interface propsType {
    class: string;
    isDisabled: boolean;
    metadata: TMetadata;
}

const SubmitEditor = forwardRef((props: propsType, ref): JSX.Element => {
    const { show } = useToast();
    const t = useTranslations('ArticleEditPage');
    const [isDisabled, setIsDisabled] = useState(false);
    const [editor] = useLexicalComposerContext();
    const [articleNoteInfo, setArticleNoteInfo] = useAtom(writeArticleNoteAtom);
    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    const setMetadata = useSetAtom(metadataAtom);

    const router = useRouter();

    useEffect(() => {
        setMetadata(props.metadata);
    }, []);

    let verifyArticleData = useCallback(() => {
        if (articleData.title.length > 199) {
            show({ type: 'DANGER', message: t('titleLenErr') });
            return;
        } else if (!/^[\s\S]*.*[^\s][\s\S]*$/.test(articleData.title)) {
            show({ type: 'DANGER', message: t('titleContentErr') });
            return;
        } else if (articleData.content.length < 20) {
            show({ type: 'DANGER', message: t('contentLenErr') });
            return;
        } else if (articleData.tags.length == 0) {
            show({ type: 'DANGER', message: t('articleTagErr') });
            return;
        } else if (articleData.typeId == 0) {
            show({ type: 'DANGER', message: t('articleTypeErr') });
            return;
        }
    }, [articleData]);

    const clearTitle = useCallback(() => {
        var title = articleData.title;
        title = title.replace(/[\r\n]/g, "");
        setArticleData(prev => {
            return {...prev, title};
        });
    }, [articleData]);

    const saveDraftMutation = useMutation({
        mutationFn: async (variables: TBody<IArticleDraft>) => {
            return (await saveArticleDraft(variables)) as IData<IArticle>;
        },
    });

    const saveDrafts = useCallback(() => {
        debounce(() => {
            setIsDisabled(true);
            let draftData = saveHandle('articleDraft');
            saveDraftMutation.mutateAsync({
                data: draftData as IArticleDraft
            }).then(res => {
                if (res.status == 200) {
                    const articleId = res.data.id;
                    if (articleId) {
                        setArticleData(prev => {
                            return {...prev, id: articleId};
                        });
                    } else {
                        show({ type: 'DANGER', message: t('saveDraftErr') });
                        setIsDisabled(false);
                        return;
                    }
                    show({ type: 'SUCCESS', message: t('saveDraftSuccess') });
                } else {
                    show({ type: 'DANGER', message: t('saveDraftErr') });
                    setIsDisabled(false);
                    return;
                }
            }).catch((e) => {
                show({ type: 'DANGER', message: e.message });
                setIsDisabled(false);
                return;
            });
            setIsDisabled(false);
        }, 500, {
            'leading': true, //在延迟开始前立即调用事件
            'trailing': false, //在延时结束后不调用,保证事件只被触发一次
        })();
    }, [editor, articleData]);

    const saveArticleMutation = useMutation({
        mutationFn: async (variables: TBody<IArticle>) => {
            return (await saveArticle(variables)) as IData<{articleId: string}>;
        },
    });
    const saveArticleData = useCallback(() => {
        debounce(() => {
            setIsDisabled(true);
            let articleInfo = saveHandle('aritlce');
            saveArticleMutation.mutateAsync({
                data: articleInfo as IArticle
            }).then(res => {
                if (res.status == 200) {
                    const articleId = res.data.articleId;
                    if (articleId!=null) {
                        // 发布成功后 清空articleData 并跳转
                        // setArticleData(writeArticleInitValue);staticRouter.articleId.replace("{id}", encodeURIComponent(articleId+""))
                        setArticleData(prev => {
                            return {...prev, articleIdStr: encodeURIComponent(articleId)};
                        });
                        router.push(staticRouter.published);
                    }
                    show({ type: 'SUCCESS', message: t('saveArticleSuccess') });
                } else {
                    show({ type: 'DANGER', message:  t('saveArticleErr') });
                    setIsDisabled(false);
                    return;
                }
            }).catch((e) => {
                show({ type: 'DANGER', message: e.message });
                setIsDisabled(false);
                return;
            });
            setIsDisabled(false);
        }, 500, {
            'leading': true,
            'trailing': false,
        })();
    }, [editor, articleData]);

    const saveHandle = (type: string) => {
        verifyArticleData();
        clearTitle();
        const os = getUserAgent();
        let sourceType = "";
        if (os.isAndroid || os.isPhone) {
            sourceType = CLIENT_TPYES.WAP;
        } else if (os.isTablet) {
            sourceType = CLIENT_TPYES.TABLET;
        } else if (os.isPc) {
            sourceType = CLIENT_TPYES.PC;
        }
        let tags = (articleData.tags).map((item)=>{
            return item.id;
        });

        // 获取文章内容
        let content = "";
        let newArticleNoteInfo: Comments = [];
        editor.update(() => {
            // 返回过滤后的标注列表
            let marks = saveMarkTag();
            newArticleNoteInfo = saveNotes(marks);
            content = $generateHtmlFromNodes(editor, null);
        }, {discrete: true});
        
        content = replaceSpan(content);
        setArticleData(prev => {
            return {...prev, content: content};
        });

        let data: IArticleDraft | IArticle;
        let marks = JSON.stringify(newArticleNoteInfo);
        if (type == 'articleDraft') {
            data = {
                articleId: articleData.id ?? 0,
                title: articleData.title,
                content: content,
                description: articleData.description,
                coverUrl: articleData.coverImage.src ?? "",
                isSetCatalog: articleData.isSetCatalog,
                tags: tags,
                typeId: articleData.typeId,
                sourceType: sourceType,
                saveType: 1,
                marks: marks
            };
        } else {
            data = {
                id: articleData.id!,
                title: articleData.title,
                content: content,
                description: articleData.description,
                tags: tags,
                typeId: articleData.typeId,
                coverUrl: articleData.coverImage.src ?? "",
                isSetCatalog: articleData.isSetCatalog,
                marks: marks
            };
        }
        return data;
    };

    // 保存标注
    const saveNotes = (marks: Array<string>) => {
        let newArticleNoteInfo = articleNoteInfo.filter((item, idx) => marks.includes(item.id));
        setArticleNoteInfo(newArticleNoteInfo);
        return newArticleNoteInfo;
    };

    useImperativeHandle(ref, () => ({ saveDrafts: saveDrafts }));

    return (
        <>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary", {"disabled": props.isDisabled || isDisabled})}
                onClick={saveDrafts}
                title={t('saveDraftsErr')}
            >
                <small>{t('saveToDrafts')}</small>
            </button>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary", {"disabled": props.isDisabled || isDisabled})}
                onClick={saveArticleData}
            >
                <small>{t('saveArticle')}</small>
            </button>
        </>
    );
});
SubmitEditor.displayName = 'SubmitEditor';
export default SubmitEditor;