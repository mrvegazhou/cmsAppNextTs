"use client";
import { FC, useCallback } from "react";
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { useAtom } from "jotai";
import { writeArticleAtom } from "@/store/articleData";
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import type { TBody } from '@/types';
import type { IData, IArticleDraft, IArticle } from '@/interfaces';
import { saveArticleDraft, saveArticle } from "@/services/api";
import { getUserAgent } from "@/lib/tool";

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { CLIENT_TPYES } from "@/lib/constant";

interface propsType {
    class: string;
    isDisabled: boolean;
}

const SubmitEditor: FC<propsType> = props => {
    const { show } = useToast();
    const t = useTranslations('ArticleEditPage');

    const [editor] = useLexicalComposerContext();

    const [articleData, setArticleData] = useAtom(writeArticleAtom);

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

    const clearTitle = () => {
        var title = articleData.title;
        title = title.replace(/[\r\n]/g, "");
        setArticleData(prev => {
            return {...prev, title};
        });
    };

    const saveDraftMutation = useMutation({
        mutationFn: async (variables: TBody<IArticleDraft>) => {
            return (await saveArticleDraft(variables)) as IData<IArticle>;
        },
    });

    const saveDrafts = () => {
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
        editor.update(() => {
            content = $generateHtmlFromNodes(editor, null);
        });
        
        let draftData: IArticleDraft = {
            articleId: articleData.id ?? 0,
            title: articleData.title,
            content: content,
            description: articleData.description,
            coverUrl: articleData.coverImage.src ?? "",
            isSetCatalog: articleData.isSetCatalog,
            tags: tags,
            typeId: articleData.typeId,
            sourceType: sourceType,
            saveType: 1
        };
        
        saveDraftMutation.mutateAsync({
            data: draftData
        }).then(res => {
            if (res.status == 200) {
                const articleId = res.data.id;
                if (articleId) {
                    setArticleData(prev => {
                        return {...prev, id: articleId};
                    });
                } else {
                    show({ type: 'DANGER', message: t('saveDraftErr') });
                    return;
                }
                show({ type: 'SUCCESS', message: t('saveDraftSuccess') });
            } else {
                show({ type: 'DANGER', message: t('saveDraftErr') });
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            return;
        });
    }

    const saveArticleMutation = useMutation({
        mutationFn: async (variables: TBody<IArticle>) => {
            return (await saveArticle(variables)) as IData<IArticle>;
        },
    });
    const saveArticleHandle = () => {
        verifyArticleData();
        clearTitle();

        let tags = (articleData.tags).map((item)=>{
            return item.id;
        });
        const tagsStr = tags.join(',');
        let articleInfo: IArticle = {
            id: articleData.id ?? 0,
            title: articleData.title,
            content: articleData.content,
            description: articleData.description,
            coverUrl: articleData.coverImage.src ?? "",
            isSetCatalog: articleData.isSetCatalog,
            tags: tagsStr,
            typeId: articleData.typeId
        };
        saveArticleMutation.mutateAsync({
            data: articleInfo
        }).then(res => {
            if (res.status == 200) {
                const articleId = res.data.id;
                if (articleId!=0) {
                    setArticleData(prev => {
                        return {...prev, id: articleId};
                    });
                }
                show({ type: 'SUCCESS', message: t('saveArticleSuccess') });
            } else {
                show({ type: 'DANGER', message:  t('saveArticleErr') });
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            return;
        });
    }

    return (
        <>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary", {"disabled": props.isDisabled})}
                onClick={saveDrafts}
                title={t('saveDraftsErr')}
            >
                <small>{t('saveToDrafts')}</small>
            </button>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary", {"disabled": props.isDisabled})}>
                <small>{t('saveArticle')}</small>
            </button>
        </>
    );
}
export default SubmitEditor;