'use client';
import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import classNames from 'classnames';
import Image from 'next/image'
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai'
import { IArticleReply, IComment, ICommentList, ICommentRepliesReq, IData } from "@/interfaces";
import PopoverComp from "@/components/popover/popover";
import { useQuery } from '@tanstack/react-query';
import Menu from "@/components/menu/Menu";
import { getCommentReplies } from "@/services/api/comment";
import { isNullOrUnDef, isNullOrUnDefOrEmpty } from "@/lib/is";
import SimpleEditor from "@/components/richEditor2/simpleEditor/App";
import LoaderComp from '@/components/loader/loader';
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { containsImgTag, replaceImgTagWithImage, replaceImgWithText } from "@/lib/stringTool";
import styles from "./replyList.module.scss";
import { QUERY_KEY } from "@/lib/constant/queryKey";
import { replyListAtom } from "@/store/comment";

interface propsType {
    onClose: () => void;
    commentId: number;
    showReportModal: (id: number, type: string) => void;
    handleCopy: (htmlString: string) => void;
    Skeleton: React.FC<{num: number, height:number}>;
    handleLike: (id: number) => void;
}
const ReplyList = (props: propsType) => {

    const {
        commentId,
        onClose,
        showReportModal,
        handleCopy,
        Skeleton,
        handleLike
    } = props;

    const t = useTranslations('ArticleComment');

    const [replies, setReplies] = useAtom<IArticleReply[]>(replyListAtom);
    const [commentInfo, setCommentInfo] = useState<IComment|null>(null);

    const popoverRefs = useRef(new Map<string, React.RefObject<typeof PopoverComp>>());
    const addPopoverRef = (index: string, ref: React.RefObject<typeof PopoverComp> | null) => {
        if (ref) {
            popoverRefs.current.set(index, ref);
        } else {
            popoverRefs.current.delete(index);
        }
    };
    const closePopover = (id: string) => {
        const popover = popoverRefs.current.get(id);        
        if (popover && 'hide' in popover ) {
            //@ts-ignore
            popover.hide();
        }
    };

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

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [orderBy, setOrderBy] = useState<string>("score");
    const [currentTime, setCurrentTime] = useState<number>(Date.now());
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [error, setError] = useState<Error>();

    // 获取类型列表
    const getCommentRepliesQuery = useQuery({
        queryKey: [QUERY_KEY.REPLIES, commentId, page, currentTime, orderBy],
        queryFn: async ({ queryKey }) => {
            const data = {commentId: 73, currentTime: queryKey[3], page: queryKey[2], orderBy: orderBy} as ICommentRepliesReq;
            return (await getCommentReplies({data: data})) as IData<ICommentList>;
        },
    });

    useEffect(() => {
        setReplies([]);
    }, []);

    useEffect(() => {
        if (getCommentRepliesQuery.data) {
            let resData = getCommentRepliesQuery.data as IData<ICommentList>;
            if (resData.status == 200) {                    
                if (!isNullOrUnDef(resData.data.comment)) {
                    // 评论详情
                    let comment = resData.data.comment as IComment;
                    comment.createTime = dayjs(comment.createTime).format('YYYY-MM-DD HH:mm:ss');
                    if (containsImgTag(comment.content)) {
                        comment.content = replaceImgTagWithImage(comment.content);
                    }
                    setCommentInfo(comment);
                    
                    // 回复列表
                    setReplies(prev => {
                        let newReplies = [];
                        const replyList = resData.data.replies;
                        try {
                            for (let item of replyList) {
                                item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss');
                                if (containsImgTag(item.content)) {
                                    item.content = replaceImgTagWithImage(item.content);
                                }
                                item.toReplyContent = replaceImgWithText(item.toReplyContent ?? "", `[${t('image')}]`);
                                newReplies.push(item);
                            }
                        } catch(e) { 
                            console.log(e); 
                        }
                        return [...prev, ...newReplies];
                    });
                }
                setHasNextPage(resData.data.hasNext!);
            } else {
                setHasNextPage(false);
            }
        }
        if (getCommentRepliesQuery.error) {
            setError(getCommentRepliesQuery.error);
        }
        setLoading(false);
    }, [getCommentRepliesQuery.data, getCommentRepliesQuery.error]);

    const loadMore = useCallback((p: number) => {
        if (loading==true) {
            return;
        }
        
        setTimeout(() => {
            setLoading(true);
            setPage(p);
        }, 500);
    }, [page, currentTime, orderBy, loading]);

    // 上拉加载更多
    const [infiniteRef] = useInfiniteScroll({
        loading,
        hasNextPage,
        onLoadMore: () => {loadMore(page+1)},
        disabled: Boolean(error),
        rootMargin: '0px 0px 400px 0px',
    });

    const PopContent = ({id, type, content}: {id: number, type: string, content: string}) => {
        let mapId = id + "-" + type;
        return (
            <Menu>
                <Menu.Item iconClass="icon-error" iconsize="15px" onClick={()=>{showReportModal(id, type);closePopover(mapId);}} text={(<span>{t('report')}</span>)} />
                <Menu.Item iconClass="icon-copy" iconsize="15px" onClick={()=>{handleCopy(content);closePopover(mapId);}} text={(<span>{t('copy')}</span>)} />
            </Menu>
        );
    };

    const [isPending, startTransition] = useTransition();
    const changeSort = (name: string) => {
        if (name===orderBy) return;
        startTransition(() => {
            setReplies([]);
            setLoading(true);
            setOrderBy(name);
            setPage(1);
            setCurrentTime(Date.now());
        });
    };

    return (
        <div className={classNames("d-flex flex-column", styles.commentList)}>
                <div className={styles.commentContent}>
                    {!isNullOrUnDef(commentInfo) && (
                        <>
                            <div className={styles.commentUserHeader}>
                                <a href="" target="_blank">
                                    <img className={classNames(styles.headerImg, 'rounded-circle shadow-4')} src={commentInfo.userInfo.avatarUrl} alt={commentInfo.userInfo.nickname} />
                                </a>
                            </div>
                            <div className={styles.commentUserContent}>
                                <div className={styles.commentUserName}>
                                    <div className={styles.userName}>
                                        <a href="" target="_blank">{commentInfo.userInfo.nickname}</a>
                                    </div>
                                    <div className={styles.userMiddle}></div>
                                    <PopoverComp ref={(ref:any) => addPopoverRef(commentInfo.id + "-comment", ref)} trigger="click" placement="bottom" content={<PopContent id={commentInfo.id} type= "comment" content={commentInfo.content} />} zIndex='99990'>
                                        <i className={classNames("iconfont icon-more", styles.more)}></i>
                                    </PopoverComp>
                                </div>
                                <div className={styles.userComment} dangerouslySetInnerHTML={{__html: commentInfo.content}}></div>
                                <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                    <div className={styles.dateAddr}>
                                        <span className="date">{commentInfo.createTime}</span>
                                        <span></span>
                                        <span className="addr">{commentInfo.ip}</span>
                                        <span></span>
                                        <span className="hot">热评</span>
                                    </div>
                                    <div className={styles.replyLike}>
                                        <button type="button" className={styles.btn} onClick={() => handleLike(commentInfo.id)}>
                                            <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                <i className="iconfont icon-like-o me-1" />
                                            </span>
                                            {commentInfo.likeCount}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.replyLine}>
                        <div className={styles.replyLineCount}>407 条回复</div>
                        <div className={styles.sort}>
                            <div className={classNames(styles.sortDefault, orderBy=='score' ? styles.sortSelected : '')} onClick={()=>changeSort('score')}>默认</div>
                            <div className={classNames(styles.sortNew, orderBy=='createTime' ? styles.sortSelected : '')} onClick={()=>changeSort('createTime')}>最新</div>
                        </div>
                    </div>
                <LoaderComp indicatorComp={<Skeleton num={3} height={10} />} loading={!getCommentRepliesQuery.isSuccess || loading || isPending}>
                    <>
                    <div className={classNames(styles.commentContentReply)}>
                    {replies.map((replyInfo, idx) => {
                        const fromUser = replyInfo.fromUser;
                        const toUser = replyInfo.toUser;
                        const createTime = replyInfo.createTime;
                        let toReplyContent = replyInfo.toReplyContent ?? "";
                        const mapId = replyInfo.id + "-reply";
                        return (
                            <div className={classNames(styles.commentContent)} key={idx}>
                                <div className={styles.commentUserHeader}>
                                    <a href="" target="_blank" className="">
                                        <PopoverComp trigger="hover" placement="top" content={""}>
                                        <img className={classNames(styles.headerImg, "rounded-circle shadow-4")} src={fromUser.avatarUrl} alt={fromUser.nickname} />
                                        </PopoverComp>
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
                                        <PopoverComp ref={(ref:any) => addPopoverRef(replyInfo.id + "-reply", ref)} trigger="click" placement="bottom" content={<PopContent id={replyInfo.id} type="reply" content={replyInfo.content} />} zIndex='99990'>
                                            <i className={classNames("iconfont icon-more", styles.more)}></i>
                                        </PopoverComp>
                                    </div>
                                    <div className={styles.userComment} dangerouslySetInnerHTML={{__html: replyInfo.content}}></div>
                                    {!isNullOrUnDefOrEmpty(toReplyContent) && (<div className={styles.quoteContent} dangerouslySetInnerHTML={{__html: toReplyContent}}></div>)}
                                    <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                        <div className={styles.dateAddr}>
                                            <span className="date">{createTime}</span>
                                            <span></span>
                                            <span className="addr">{replyInfo.ip}</span>
                                            <span></span>
                                            <span className="hot">热评</span>
                                        </div>
                                        <div className={styles.replyLike}>
                                            <button type="button" className={styles.btn} onClick={() => {showEditorFn(mapId);}}>
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
                                    <div className={classNames(styles.commentEditor)}>
                                        <SimpleEditor ref={(ref:any) => addEditorRef(mapId, ref)} cls="hidden" extraData={{type:"reply", commentId:commentId, replyId:replyInfo.id}}/>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                    </>
                </LoaderComp>
            
            {hasNextPage && (getCommentRepliesQuery.isSuccess && (
                <div className={styles.commentList} ref={infiniteRef}>
                    {loading ? <Skeleton num={3} height={10} /> : ""}x
                </div>
            ))}

            {(!isNullOrUnDef(commentInfo) && !isNullOrUnDef(commentInfo.userInfo.avatarUrl)) && (
                <div className={classNames(styles.commentBottomEditor, "")}>
                    <Image className={styles.headerImg} src={commentInfo.userInfo.avatarUrl!} width={40} height={40} alt={commentInfo.userInfo.nickname} />
                    <SimpleEditor ref={(ref:any) => addEditorRef(commentId+"-comment", ref)}  
                        showToolBar={false} 
                        emojisplacement="top" 
                        cls={styles.editorHeight} 
                        placeholderText={`回复 ${commentInfo.userInfo.nickname}`}
                        extraData={{type:"reply", commentId:commentId, replyId:0}}
                    />
                </div>
            )}
        </div>
    );
};
export default ReplyList;