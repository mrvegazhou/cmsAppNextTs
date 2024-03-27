"use client";
import { useState, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai';
import { writeArticleAtom } from "@/store/articleData";
import { IArticleInit } from "@/interfaces";
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import type { TBody } from '@/types';
import type { IData, IArticleDraft, IArticleId } from '@/interfaces';
import { getDraftHistoryList, getDraftHistoryInfo } from "@/services/api";
import Modal from '@/components/modal';
import Steps from "@/components/steps/steps";
import LoaderComp from '@/components/loader/loader';
import dayjs from 'dayjs';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getRoot, CLEAR_EDITOR_COMMAND, $isElementNode, $isDecoratorNode, $insertNodes} from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { ARTICLE_PERSONAL_IMAGE_URL, CLIENT_TPYES, SAVE_TYPE } from "@/lib/constant";
import { ITag } from "@/interfaces";
import ContentComp from "@/app/[locale]/(cms)/article/[id]/articleContent";

interface propsType {
    class?: string;
}

const HistoryEditor = (props: propsType) => {
    const { show } = useToast();
    const t = useTranslations('ArticleEditPage');
    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    const [open, setOpen] = useState<boolean>(false);
    const [historyList, setHistoryList] = useState<IArticleDraft[]>([]);

    const [editor] = useLexicalComposerContext();

    const historyListMutation = useMutation({
        mutationFn: async (variables: TBody<IArticleId>) => {
            return (await getDraftHistoryList(variables)) as IData<IArticleDraft[]>;
        },
        retry: 3
    });

    const showHistory = () => {
        setArticleData(prev => {
            return {...prev, id: 194}
        })
        setOpen(!open);
        if (!articleData.id) {
            return;
        }
        historyListMutation.mutateAsync({
            data: {
                articleId: articleData.id
            }
        }).then(res => {
            if (res.status == 200) {
                setHistoryList(res.data);
            }
        });
    };

    const historyInfoMutation = useMutation({
        mutationFn: async (variables: TBody<{id: number}>) => {
            return (await getDraftHistoryInfo(variables)) as IData<IArticleDraft>;
        }, 
        retry: 3
    });
    const getHistoryInfo = (id: number) => {
        historyInfoMutation.mutateAsync({
            data: {
                id: id
            }
        }).then(res => {
            if (res.status == 200) {
                let data = res.data;
                const createTime = dayjs(data.createTime);
                let newVal: IArticleInit = {
                    id: data.articleId,
                    title: data.title,
                    content: data.content,
                    tags: data.tags as ITag[],
                    typeId: data.typeId,
                    coverImage: {name:'', width:0, height:0, tag:'', src: ARTICLE_PERSONAL_IMAGE_URL + data.coverUrl},
                    description: data.description,
                    createTime: createTime.format("YYYY-MM-DD HH:mm:ss"),
                    isSetCatalog: data.isSetCatalog
                } as IArticleInit;
                setArticleData({...newVal});
                // 清空
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                // 填充历史内容
                editor.update(() => {
                    const parse = new DOMParser()
                    const text = parse.parseFromString(data.content, 'text/html')
                    const nodes = $generateNodesFromDOM(editor, text)
                    const root = $getRoot()
                    nodes.forEach((node, i) => {
                        if ($isElementNode(node) || $isDecoratorNode(node)) {
                            root.append(node)
                        }
                    });
                    $insertNodes(nodes);
                });
                editor.focus();
            }
        });
    };

    const HistoryContent = useCallback((): JSX.Element => {
        return (
            <div className="row">
                <div className="col-3 overflow-scroll text-nowrap bg-white">
                    <LoaderComp className="d-flex justify-content-start align-items-center" loading={historyListMutation.isIdle}>
                        <Steps direction="vertical" progressDot style={{ padding: '20px 0' }}>
                            {historyList.map((item, idx) => {
                                const timeStr = dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss");
                                let desc = "";
                                let saveType = item.saveType==SAVE_TYPE.MANUAL ? t('manualSave') : t('autoSave');
                                if (item.sourceType==CLIENT_TPYES.WAP) {
                                    desc = t('wapClient');
                                } else if (item.sourceType==CLIENT_TPYES.PC) {
                                    desc = t('pcClient');
                                } else if (item.sourceType==CLIENT_TPYES.TABLET) {
                                    desc = t('tabletClient');
                                }
                                desc += saveType;
                                return (
                                    <Steps.Step key={idx} title={timeStr} description={desc} className="cursor-pointer" onClick={() => getHistoryInfo(item.id!)} />
                                );
                            })}
                        </Steps>
                    </LoaderComp>
                </div>
                <div className="col-9 d-flex flex-row">
                    <div className="d-flex" style={{height:'100%'}}>
                        <div className="vr"></div>
                    </div>
                    <div className="ms-3 overflow-scroll">
                        <ContentComp content={articleData.content} />
                    </div>
                </div>
            </div>
        );
    }, [historyList, articleData]);

    return (
        <>
            <div onClick={showHistory}>{t('historyLogs')}</div>

            <Modal
                title={t('historyEditList')}
                isOpen={open}
                onClosed={()=>{setOpen(false);}}
                type="light"
                useButton={false}
                minWidth={860}
            >
                <HistoryContent />
            </Modal>
        </>
    );
}

export default HistoryEditor;
