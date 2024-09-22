"use client";
import { useState, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useAtom, useSetAtom } from 'jotai';
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
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { PERSONAL_IMAGE_URL, CLIENT_TPYES, SAVE_TYPE } from "@/lib/constant";
import { ITag } from "@/interfaces";
import ContentComp from "@/app/[locale]/(cms)/article/[id]/articleContent";
import { showLoginModalAtom } from "@/store/userData";

interface propsType {
    class?: string;
}

const HistoryEditor = (props: propsType) => {
    // 当前选中的
    const [selected, setSelected] = useState("");
    const t = useTranslations('ArticleEditPage');
    const [articleLocalData, setArticleLocalData] = useAtom(writeArticleAtom);
    const [articleInfo, setArticleInfo] = useState<IArticleInit | null>(null);

    const [open, setOpen] = useState<boolean>(false);
    const [historyList, setHistoryList] = useState<IArticleDraft[]>([]);

    const [editor] = useLexicalComposerContext();

    const showLoginModal = useSetAtom(showLoginModalAtom);

    const historyListMutation = useMutation({
        mutationFn: async (variables: TBody<IArticleId>) => {
            return (await getDraftHistoryList(variables)) as IData<IArticleDraft[]>;
        }
    });

    const showHistory = () => {
        setArticleLocalData(prev => {
            return {...prev, id: 194}
        })
        setOpen(!open);
        if (!articleLocalData.id) {
            return;
        }
        historyListMutation.mutateAsync({
            data: {
                articleId: articleLocalData.id
            }
        }).then(res => {
            if (res.status == 200) {
                setHistoryList(res.data);
            }
        }).catch(err => {
            if (typeof err == 'string' && err.startsWith('401')) {
                setOpen(false);
                showLoginModal('401');
            }
        });
    };

    const historyInfoMutation = useMutation({
        mutationFn: async (variables: TBody<{id: number}>) => {
            return (await getDraftHistoryInfo(variables)) as IData<IArticleDraft>;
        }
        // retry: 3
    });
    const getHistoryInfo = (id: number) => {
        setSelected("history-"+id);
        historyInfoMutation.mutateAsync({data: { id: id }}).then(res => {
            if (res.status == 200) {
                let data = res.data;
                setEditorContent(data.content);
                // 填充历史内容
                editor.update(() => {
                    const createTime = dayjs(data.createTime);
                    let articleDraftInfo: IArticleInit = {
                        id: data.articleId,
                        title: data.title,
                        content: data.content,
                        tags: data.tags as ITag[],
                        typeId: data.typeId,
                        coverImage: {fileName:'', width:0, height:0, tag:'', src: PERSONAL_IMAGE_URL + data.coverUrl},
                        description: data.description,
                        createTime: createTime.format("YYYY-MM-DD HH:mm:ss"),
                        isSetCatalog: data.isSetCatalog
                    } as IArticleInit;
                    if (data.content) {
                        const htmlContent = $generateHtmlFromNodes(editor);
                        setArticleInfo(prev => {
                            return { ...articleDraftInfo, content: htmlContent };
                        });
                    }
                });
                
            }
        }).catch(err => {
            console.log("catch: ", err);
            if (typeof err == 'string' && err.startsWith('401')) {
                setOpen(false);
                showLoginModal('401');
            }
        });    
    };

    const showLocalArticleInfo = () => {
        setSelected("now");
        setEditorContent(articleLocalData.content);
        editor.update(() => {
            const htmlContent = $generateHtmlFromNodes(editor);
            setArticleInfo(prev => {
                return { ...articleInfo!, content: htmlContent };
            });
        });
    };

    // 
    const setEditorContent = (content: string) => {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        const savedState = JSON.parse(content);
        const newState = editor.parseEditorState(savedState);
        editor.setEditorState(newState);
    };

    // 使用
    const done = () => {
        if (selected=="") return;
        setArticleLocalData(prev => {
            return {...prev, ...articleInfo, createTime: dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss")};
        });
        editor.focus();
    };

    const HistoryContent = useCallback((): JSX.Element => {
        return (
            <div className="row">
                <div className="col-3 overflow-scroll text-nowrap bg-white">
                    <LoaderComp className="d-flex justify-content-start align-items-center" loading={historyListMutation.isPending}>
                        <Steps direction="vertical" progressDot style={{ padding: '20px 0' }}>
                            <Steps.Step 
                                selected={selected=="now" ? "text-body" : ""}
                                title={dayjs(articleLocalData.createTime).format("YYYY-MM-DD HH:mm:ss")} 
                                description="当前内容" 
                                className={"cursor-pointer"} 
                                onClick={showLocalArticleInfo} 
                            />
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
                                    <Steps.Step 
                                        key={idx} 
                                        title={timeStr} 
                                        description={desc} 
                                        selected={selected=="history-"+item.id ? "text-body" : ""}
                                        className="cursor-pointer" onClick={() => getHistoryInfo(item.id!)} />
                                );
                            })}
                        </Steps>
                    </LoaderComp>
                </div>
                <div className="col-9 d-flex flex-row">
                    <div className="d-flex" style={{height:'100%'}}>
                        <div className="vr"></div>
                    </div>
                    <div className="overflow-scroll ps-2">
                        <ContentComp content={articleInfo!=null ? articleInfo.content : ""} />
                    </div>
                </div>
            </div>
        );
    }, [historyList, articleInfo]);

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
                <div className="position-absolute bottom-0 end-0 pe-4 pb-4">
                    <button disabled={selected==""} type="button" className="btn btn-outline-primary" onClick={done}>使用</button>
                </div>
            </Modal>
        </>
    );
}

export default HistoryEditor;
