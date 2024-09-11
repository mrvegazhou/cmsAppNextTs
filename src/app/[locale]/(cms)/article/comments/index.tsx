'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import copy from 'copy-to-clipboard';
import { debounce } from "lodash-es"
import { useMutation } from '@tanstack/react-query';
import { userDataAtom } from "@/store/userData";
import SimpleEditor from "@/components/richEditor2/simpleEditor/App";
import useToast from '@/hooks/useToast';
import PopoverComp from "@/components/popover/popover";
import Menu from "@/components/menu/Menu";
import { IArticleCommentListResp, ICommentListReq, ICommentList, IData } from '@/interfaces';
import type { TBody } from '@/types';
import { currentArticleDataAtom } from '@/store/articleData';
import { getArticleCommentList } from '@/services/api/comment';
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { SkeletonLayout } from "@/components/skeleton/layout";
import styles from "./index.module.scss";
import { isNullOrUnDef, isNullOrUnDefOrLen0 } from "@/lib/is";
import { commentListAtom } from "@/store/comment";
import Image from 'next/image';
import LoaderComp from '@/components/loader/loader';
import { postTypeValAtom } from "@/store/editorPost";
import { containsImgTag, replaceImgTagWithImage, replaceImgWithText } from "@/lib/stringTool";
import { ReportComp } from "@/app/[locale]/_common/report/report";


interface propsType {

}
const ArticleComments = (props: propsType) => {
    const userData = useAtomValue(userDataAtom);
    const t = useTranslations('ArticleComment');
    const { show } = useToast();

    const [comments, setComments] = useAtom<ICommentList[]>(commentListAtom);
    const articleInfo = useAtomValue(currentArticleDataAtom);
    const [currentTime, setCurrentTime] = useState<number>(Date.now());
    const [page, setPage] = useState<number>(1);
    const [orderBy, setOrderBy] = useState<string>("score");
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error>();
    const [mapIsOpens, setMapIsOpens] = useState<Map<string, boolean>>(new Map<string, boolean>());
    // 是否为评论还是回复
    const setPostTypeValAtom = useSetAtom(postTypeValAtom);

    const [sortName, setSortName] = useState<string>('score');
    const changeSort = (name: string) => {
        if (name==sortName) {
            return;
        }
        debounce(() => {
            setSortName(name);
            setPage(1);
            setCurrentTime(Date.now());
            setComments([]);
            loadMore(1);
        }, 500)();
    };

    const togglePopoverMapValue = (key: string, flag: boolean) => {
        setMapIsOpens((prevMap) => {
            const newMap = new Map(prevMap);
            newMap.set(key, flag);
            return newMap;
        });
    };

    const getAppTypeListQuery = useMutation({
        mutationFn: async (variables: TBody<ICommentListReq>) => {
            return (await getArticleCommentList(variables)) as IData<IArticleCommentListResp>;
        },
    });

    const loadMore = useCallback((p: number) => {
        if (getAppTypeListQuery.isPending || loading==true) {
            return;
        }
        setTimeout(() => {
            setLoading(true);
            const data = {articleId: articleInfo.id, currentTime: currentTime, page: p, orderBy: orderBy} as ICommentListReq;
            getAppTypeListQuery.mutateAsync({
                data: data
            }).then(res => {
                if (res.status == 200) {
                    if (isNullOrUnDefOrLen0(res.data.commentList)) {
                        setLoading(false);
                    } else {
                        setComments(prev => {
                            let newCommentList = [];
                            const comments = res.data.commentList;
                            try {
                                for (let item of comments) {
                                    let comment = item.comment;
                                    comment.createTime = dayjs(comment.createTime).format('YYYY-MM-DD HH:mm:ss');
                                    if (containsImgTag(comment.content)) {
                                        comment.content = replaceImgTagWithImage(comment.content);
                                    }
                                    let replies = [];
                                    if (!isNullOrUnDef(item.replies)) {
                                        for (let reply of item.replies) {
                                            reply.createTime = dayjs(reply.createTime).format('YYYY-MM-DD HH:mm:ss');
                                            if (containsImgTag(reply.content)) {
                                                reply.content = replaceImgTagWithImage(reply.content);
                                            }
                                            reply.toReplyContent = replaceImgWithText(reply.toReplyContent ?? "", `[${t('image')}]`);
                                            replies.push(reply);
                                        }
                                    }
                                    newCommentList.push({comment: comment, replies: replies});
                                }
                            } catch(e) { console.log(e); }
                            return [...prev, ...newCommentList];
                        });
                        setCurrentTime(res.data.currentTime);
                        setPage(p);
                    }
                    setHasNextPage(res.data.hasNext);
                } else {
                    setLoading(false);
                    setHasNextPage(false);
                }
            }).catch((error_) => {
                setHasNextPage(false);
                setError(
                    error_ instanceof Error ? error_ : new Error('Something went wrong'),
                );
            }).finally(() => {
                setLoading(false);
            });
        }, 1000);
        
    }, [page, currentTime]);

    useEffect(() => {
        loadMore(1);
    }, []);

    const simpleEditorsRefs = useRef(new Map<string, React.RefObject<typeof SimpleEditor>>());

    const addEditorRef = (index: string, ref: React.RefObject<typeof SimpleEditor> | null) => {
        if (ref) {
          simpleEditorsRefs.current.set(index, ref);
        } else {
          simpleEditorsRefs.current.delete(index);
        }
    };

    const showEditorFn = (id: string) => {
        const eleRef = simpleEditorsRefs.current.get(id);
        if (eleRef && 'changeCls' in eleRef && 'getCls' in eleRef) {
            //@ts-ignore
            if (eleRef.getCls()=='hidden') {
                //@ts-ignore
                eleRef.changeCls('');
            } else {
                //@ts-ignore
                eleRef.changeCls('hidden');
            }
        }
    };

    const Skeleton = useCallback(({num, height}: {num: number; height: number}) => {
        let items = [];
        for (let i = 1; i <= num; i++) {
            let item = { height: height, width: '90%', marginBottom: 10 };
            items.push(item);
        }
        return <SkeletonLayout align="center" items={items}/>
    }, []);

    
    const handleLike = useCallback((id: number) => {

    }, []);

    const handleCopy = useCallback((htmlString: string, id: string) => {
        let resultText = replaceImgWithText(htmlString, `[${t('image')}]`)
        copy(resultText);
        show({ type: 'DANGER', message: t('copySuccess') });
        togglePopoverMapValue(id, false);
    }, []);


    // 上拉加载更多
    const [infiniteRef] = useInfiniteScroll({
        loading,
        hasNextPage,
        onLoadMore: () => loadMore(page+1),
        disabled: Boolean(error),
        rootMargin: '0px 0px 400px 0px',
    });

    const reportRef = useRef(null);
    const showReportModal = useCallback((id: number, type: string) => {
        // @ts-ignore
        if (reportRef.current && reportRef.current.showReportModal) {
            // @ts-ignore    
            reportRef.current.showReportModal(id, type);
        }
    }, []);

    const CommentListDiv = useCallback(() => {
        return comments.map((comment, idx) => {
            const commentInfo = comment.comment;
            const replyList = comment.replies;
            const userInfo = commentInfo.userInfo;
            const id = commentInfo.id;
            const createTime = commentInfo.createTime;
            const popContent = (
                <Menu>
                    <Menu.Item iconClass="icon-error" iconsize="15px" onClick={()=>showReportModal(id, 'comment')} text={(<span>{t('report')}</span>)} />
                    <Menu.Item iconClass="icon-copy" iconsize="15px" onClick={()=>handleCopy(commentInfo.content, id+"")} text={(<span>{t('copy')}</span>)} />
                </Menu>
            );
            return (
                <div className={styles.commentList} key={idx}>
                    <div className={styles.commentContent}>
                        <div className={styles.commentUserHeader}>
                            <a href="" target="_blank">
                                <img className={classNames(styles.headerImg, 'rounded-circle shadow-4')} src={userInfo.avatarUrl} alt={userInfo.nickname} />
                            </a>
                        </div>
                        <div className={styles.commentUserContent}>
                            <div className={styles.commentUserName}>
                                <div className={styles.userName}>
                                    <a href="" target="_blank">{userInfo.nickname}</a>
                                </div>
                                <div className={styles.userMiddle}></div>
                                <PopoverComp isOpen={mapIsOpens.get(id+"")} trigger="click" placement="bottom" content={popContent} zIndex='9999'>
                                    <i className={classNames("iconfont icon-more", styles.more)}></i>
                                </PopoverComp>
                            </div>
                            <div className={styles.userComment} dangerouslySetInnerHTML={{__html: commentInfo.content}}></div>
                            <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                <div className={styles.dateAddr}>
                                    <span className="date">{createTime}</span>
                                    <span></span>
                                    <span className="addr">{commentInfo.ip}</span>
                                    <span></span>
                                    <span className="hot">热评</span>
                                </div>
                                <div className={styles.replyLike}>
                                    <button type="button" className={styles.btn} onClick={() => {showEditorFn(id+""); setPostTypeValAtom({type:"reply", pid:id});}}>
                                        <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                            <i className="iconfont icon-comment me-1" />
                                        </span>回复
                                    </button>
                                    <button type="button" className={styles.btn} onClick={() => handleLike(id)}>
                                        <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                            <i className="iconfont icon-like-o me-1" />
                                        </span>
                                        {commentInfo.likeCount}
                                    </button>
                                </div>
                            </div>
                            <div className={classNames(styles.commentEditor)} onClick={()=>{setPostTypeValAtom({type:"reply", pid:id});}}>
                                <SimpleEditor ref={(ref:any) => addEditorRef(id+"", ref)} cls="hidden"/>
                            </div>
                        </div>
                    </div>
                    { (typeof replyList!='undefined' && replyList!=null && replyList.length>0) &&
                    <div className={classNames(styles.commentContentReply)}>
                    {
                        replyList.map((replyInfo, idx2) => {
                            const fromUser = replyInfo.fromUser;
                            const toUser = replyInfo.toUser;
                            const createTime = replyInfo.createTime;
                            const mapId = id + "-" + replyInfo.id;
                            let toReplyContent = replyInfo.toReplyContent ?? "";
                            const popContent = (
                                <Menu>
                                    <Menu.Item iconClass="icon-error" iconsize="15px" text={(<span onClick={()=>showReportModal(replyInfo.id, 'reply')}>{t('report')}</span>)} />
                                    <Menu.Item iconClass="icon-copy" iconsize="15px" text={(<span onClick={()=>handleCopy(replyInfo.content, mapId)}>{t('copy')}</span>)} />
                                </Menu>
                            );
                            return ( 
                                <div className={classNames(styles.commentContent, styles.indent)} key={idx2}>
                                    <div className={styles.commentUserHeader}>
                                        <a href="" target="_blank" className="">
                                            <img className={classNames(styles.headerImg, "rounded-circle shadow-4")} src={fromUser.avatarUrl} alt={fromUser.nickname} />
                                        </a>
                                    </div>
                                    <div className={styles.commentUserContent}>
                                        <div className={styles.commentUserName}>
                                            <div className={styles.userName}>
                                                <a href="" target="_blank">
                                                {fromUser.nickname}
                                                </a>
                                                {replyInfo.replyId!=0 && (
                                                    <div className={styles.toUser}>
                                                        <i className="iconfont icon-youjiantou" />
                                                        <a className={styles.replyUserName} href="">{toUser.nickname}</a>
                                                    </div>
                                                )}
                                                
                                            </div>
                                            <div className={styles.userMiddle}></div>
                                            <PopoverComp isOpen={mapIsOpens.get(mapId)} trigger="click" placement="bottom" content={popContent} zIndex='9999'>
                                                <i className={classNames("iconfont icon-more", styles.more)}></i>
                                            </PopoverComp>
                                        </div>
                                        <div className={styles.userComment} dangerouslySetInnerHTML={{__html: replyInfo.content}}></div>
                                        <div className={styles.quoteContent} dangerouslySetInnerHTML={{__html: toReplyContent}}></div>
                                        <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                            <div className={styles.dateAddr}>
                                                <span className="date">{createTime}</span>
                                                <span></span>
                                                <span className="addr">{replyInfo.ip}</span>
                                                <span></span>
                                                <span className="hot">热评</span>
                                            </div>
                                            <div className={styles.replyLike}>
                                                <button type="button" className={styles.btn} onClick={() => {showEditorFn(mapId); setPostTypeValAtom({type:"reply", pid: replyInfo.id});}}>
                                                    <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                        <i className="iconfont icon-comment me-1" />
                                                    </span>回复
                                                </button>
                                                <button type="button" className={styles.btn}>
                                                    <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                        <i className="iconfont icon-like-o me-1" />
                                                    </span>{replyInfo.likeCount}
                                                </button>
                                            </div>
                                        </div>
                                        <div className={classNames(styles.commentEditor)} onClick={()=>{setPostTypeValAtom({type:"reply", pid:replyInfo.id});}}>
                                            <SimpleEditor ref={(ref:any) => addEditorRef(mapId, ref)} cls="hidden"/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                    </div>
                    }
                </div>
            );
        })
    }, [comments, mapIsOpens]);

    return (
        <>
            <div className={styles.commentContainer} style={{height: "auto"}}>
                <ArticleCommentEditor />
                <div className={styles.header}>
                    <div className={styles.title}>{articleInfo.commentCount??0}条评论</div>
                    <div className={styles.null}></div>
                    <div className={styles.sort}>
                        <div className={classNames(styles.sortDefault, sortName=='score' ? styles.sortSelected : '')} onClick={()=>changeSort('score')}>默认</div>
                        <div className={classNames(styles.sortNew, sortName=='createTime' ? styles.sortSelected : '')} onClick={()=>changeSort('createTime')}>最新</div>
                    </div>
                </div>
                <LoaderComp size="large" loading={!getAppTypeListQuery.isSuccess || loading}>
                    <CommentListDiv />
                </LoaderComp>
                {hasNextPage && (getAppTypeListQuery.isSuccess && (
                    <div className={styles.commentList} ref={infiniteRef}>
                        {loading ? <Skeleton num={3} height={10} /> : ""}
                    </div>
                ))}
            </div>
            <ReportComp ref={reportRef} />
        </>
    );
}
export default ArticleComments;

const ArticleCommentEditor = () => {
    const simpleEditorRef = useRef(null);
    const setPostTypeValAtom = useSetAtom(postTypeValAtom);
    return (
        <div className={styles.commentUserEditor} onClick={()=>{setPostTypeValAtom({type: 'comment', pid: 0});}}>
            <img className={styles.avatar} src="https://pica.zhimg.com/v2-5cd72e004ec62e6052ebccf7836f26f5_l.jpg?source=32738c0c" />
            <div className="ms-2 w-100">
                <SimpleEditor ref={simpleEditorRef} />
            </div>
        </div>
    );
};