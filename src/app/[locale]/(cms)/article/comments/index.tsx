'use client';
import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useAtom, useAtomValue } from 'jotai'
import copy from 'copy-to-clipboard';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userDataAtom } from "@/store/userData";
import SimpleEditor from "@/components/richEditor2/simpleEditor/App";
import useToast from '@/hooks/useToast';
import PopoverComp from "@/components/popover/popover";
import Menu from "@/components/menu/Menu";
import { IArticleCommentListResp, ICommentListReq, ICommentList, IData } from '@/interfaces';
import { currentArticleDataAtom } from '@/store/articleData';
import { getArticleCommentList } from '@/services/api/comment';
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { SkeletonLayout } from "@/components/skeleton/layout";
import styles from "./index.module.scss";
import { isNullOrUnDef, isNullOrUnDefOrEmpty, isNullOrUnDefOrLen0 } from "@/lib/is";
import { commentListAtom } from "@/store/comment";
import LoaderComp from '@/components/loader/loader';
import { containsImgTag, formatNumber, replaceImgWithText } from "@/lib/stringTool";
import { ReportComp } from "@/app/[locale]/_common/report/report";
import useModal from '@/hooks/useModal/show';
import ReplyList from "./replyList";
import AvatarPop from "../../user/avatar/avatarPop";
import { COMMENT_KEY } from "@/lib/constant/queryKey";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { TBody } from "@/types";


interface propsType {
    mode?: string;
}
const ArticleComments = (props: propsType) => {
    const mode = props.mode ?? 'drawer';
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

    const [isPending, startTransition] = useTransition();
    const changeSort = (name: string) => {
        if (name===orderBy) return;
        startTransition(() => {
            setComments([]);
            setLoading(true);
            setOrderBy(name);
            setPage(1);
            setCurrentTime(Date.now());
        });
    };

    const getCommentListQuery = useQuery({
        queryKey: [COMMENT_KEY.COMMENT, articleInfo.id, page, currentTime, orderBy],
        queryFn: async ({ queryKey }) => {
            const data = {articleId: articleInfo.id, currentTime: currentTime, page: page, orderBy: orderBy} as ICommentListReq;
            return (await getArticleCommentList({data: data})) as IData<IArticleCommentListResp>;
        },
    });

    

    useEffect(() => {
        if (getCommentListQuery.data) {
            let resData = getCommentListQuery.data as IData<IArticleCommentListResp>;
            if (resData.status == 200) {
                if (!isNullOrUnDefOrLen0(resData.data.commentList)) {
                    setComments(prev => {
                        let newCommentList = [];
                        const comments = resData.data.commentList;
                        try {
                            
                            for (let item of comments) {
                                let comment = item.comment;
                                comment.createTime = dayjs(comment.createTime).format('YYYY-MM-DD HH:mm:ss');
                                if (containsImgTag(comment.content)) {
                                    comment.contentComp = extractTextAndImages(comment.content);
                                }
                                let replies = [];
                                if (!isNullOrUnDef(item.replies)) {
                                    for (let reply of item.replies) {
                                        reply.createTime = dayjs(reply.createTime).format('YYYY-MM-DD HH:mm:ss');
                                        if (containsImgTag(reply.content)) {
                                            reply.contentComp = extractTextAndImages(reply.content)
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
                }
                setHasNextPage(resData.data.hasNext);
            } else {
                setHasNextPage(false);
            }
        }
        if (getCommentListQuery.error) {
            setError(getCommentListQuery.error);
        }
        setLoading(false);
    }, [getCommentListQuery.data, getCommentListQuery.error]);

    const loadMore = useCallback((p: number) => {
        if (loading==true) {
            return;
        }
        setTimeout(() => {
            setLoading(true);
            setPage(p);
        }, 500); 
    }, [page, orderBy, loading]);

    const simpleEditorsRefs = useRef(new Map<string, React.RefObject<typeof SimpleEditor>>());
    const addEditorRef = (index: string, ref: React.RefObject<typeof SimpleEditor> | null) => {
        if (ref) {
          simpleEditorsRefs.current.set(index, ref);
        } else {
          simpleEditorsRefs.current.delete(index);
        }
    };

    const popoverRefs = useRef(new Map<string, React.RefObject<typeof PopoverComp>>());
    const addPopoverRef = (index: string, ref: React.RefObject<typeof PopoverComp> | null) => {
        if (ref) {
            popoverRefs.current.set(index, ref);
        } else {
            popoverRefs.current.delete(index);
        }
    };
    const closePopover = useCallback((id: string) => {
        const popover = popoverRefs.current.get(id);        
        if (popover && 'hide' in popover ) {
            //@ts-ignore
            popover.hide();
        }
    }, []);


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

    // 点赞和不喜欢
    const doUnlikeMutation = useMutation({
        mutationFn: async (variables: TBody<{articleId: number}>) => {
            return (await doCommentDislike(variables)) as IData<boolean>;
        },
    });

    const doLikeMutation = useMutation({
        mutationFn: async (variables: TBody<{articleId: number}>) => {
            return (await doCommentLike(variables)) as IData<boolean>;
        },
    });
    const handleLike = useCallback((id: number) => {

    }, []);

    const handleUnLike = useCallback((id: number) => {

    }, []);

    const handleCopy = useCallback((htmlString: string) => {
        let resultText = replaceImgWithText(htmlString, `[${t('image')}]`)
        copy(resultText);
        show({ type: 'SUCCESS', message: t('copySuccess'), containerStyle: {zIndex: 99993} });
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

    //查看全部回复
    const [modal, showModal] = useModal();
    const viewAllReplies = useCallback((commentId: number) => {
        showModal(t('replyTitle'), (onClose) => (
            <ReplyList 
                onClose={onClose}
                commentId={commentId}
                showReportModal={showReportModal}
                handleCopy={handleCopy}
                Skeleton={Skeleton}
                handleLike={handleLike}
            />
        ), {minWidth: 600, width: '600px', cls: 'zIndex', height: "90%", bodyStyle: {overflowY:'auto', height:'90%', padding: "0px"}});
    }, [showModal]);

    const PopContent = ({id, type, content}: {id: number, type: string, content: string}) => {
        let mapId = id + "-" + type;
        return (
            <Menu>
                <Menu.Item iconClass="icon-error" iconsize="15px" onClick={()=>{showReportModal(id, type);closePopover(mapId);}} text={(<span>{t('report')}</span>)} />
                <Menu.Item iconClass="icon-copy" iconsize="15px" onClick={()=>{handleCopy(content);closePopover(mapId);}} text={(<span>{t('copy')}</span>)} />
            </Menu>
        );
    };

    // 头像弹层
    const PopAvatarContent = () => {
        return (
            <div>
                <AvatarPop />
            </div>
        );
    };

    const CommentListDiv = useCallback(() => {
        return comments.map((comment, idx) => {
            const commentInfo = comment.comment;
            const replyList = comment.replies;
            const userInfo = commentInfo.userInfo;
            const id = commentInfo.id;
            const createTime = commentInfo.createTime;
            const mapId = id + "-comment";
            
            return (
                <div className={styles.commentList} key={idx}>
                    <div className={styles.commentContent}>
                        <div className={styles.commentUserHeader}>
                            <a href="" target="_blank">
                            <PopoverComp visibleArrow={false} trigger="hover" content={<PopAvatarContent />}  autoAdjustOverflow={true}>
                                <div className={styles.header}>
                                    <img className={classNames(styles.headerImg, 'rounded-circle shadow-4')} src={userInfo.avatarUrl} alt={userInfo.nickname} />
                                </div>
                            </PopoverComp>
                            </a>
                        </div>
                        <div className={styles.commentUserContent}>
                            <div className={styles.commentUserName}>
                                <div className={styles.userName}>
                                    <a href="" target="_blank">{userInfo.nickname}</a>
                                </div>
                                <div className={styles.userMiddle}></div>
                                <PopoverComp ref={(ref:any) => addPopoverRef(mapId, ref)} trigger="click" placement="bottom" content={<PopContent id={id} type="comment" content={commentInfo.content} />} zIndex={mode==="drawer" ?? '9999'}>
                                    <i className={classNames("iconfont icon-more", styles.more)}></i>
                                </PopoverComp>
                            </div>
                            {!isNullOrUnDef(commentInfo.contentComp) ? (
                                <div className={styles.userComment}>{commentInfo.contentComp}</div>
                            ) : <div className={styles.userComment} dangerouslySetInnerHTML={{__html: commentInfo.content}}></div>}
                            <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                <div className={styles.dateAddr}>
                                    <span className="date">{createTime}</span>
                                    <span></span>
                                    <span className="addr">{commentInfo.ip}</span>
                                    <span></span>
                                    <span className="hot">热评</span>
                                </div>
                                <div className={styles.replyLike}>
                                    <button type="button" className={styles.btn} onClick={() => {showEditorFn(mapId);}}>
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
                                    <button type="button" className={styles.btn} onClick={() => handleUnLike(id)}>
                                        <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                            <i className="iconfont icon-unlike-o me-1" />
                                        </span>
                                        {commentInfo.dislikeCount}
                                    </button>
                                </div>
                            </div>
                            <div className={classNames(styles.commentEditor)}>
                                <SimpleEditor ref={(ref:any) => addEditorRef(mapId, ref)} cls="hidden" extraData={{type:"reply", commentId:id, replyId: 0}}/>
                            </div>
                        </div>
                    </div>
                    { !isNullOrUnDefOrLen0(replyList) &&
                    <div className={classNames(styles.commentContentReply)}>
                    {
                        replyList.map((replyInfo, idx2) => {
                            const fromUser = replyInfo.fromUser;
                            const toUser = replyInfo.toUser;
                            const createTime = replyInfo.createTime;
                            const mapId = replyInfo.id + "-reply";
                            let toReplyContent = replyInfo.toReplyContent ?? "";
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
                                            <PopoverComp ref={(ref:any) => addPopoverRef(mapId, ref)} trigger="click" placement="bottom" content={<PopContent id={replyInfo.id} type="reply" content={replyInfo.content} />}  zIndex={mode==="drawer" ?? '9999'}>
                                                <i className={classNames("iconfont icon-more", styles.more)}></i>
                                            </PopoverComp>
                                        </div>
                                        {!isNullOrUnDef(replyInfo.contentComp) ? <div className={styles.userComment}>{replyInfo.contentComp}</div> : <div className={styles.userComment} dangerouslySetInnerHTML={{__html: replyInfo.content}}></div>}
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
                                            <SimpleEditor ref={(ref:any) => addEditorRef(mapId, ref)} cls="hidden" extraData={{type:"reply", commentId:id, replyId:replyInfo.id}}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                    </div>
                    }
                    { commentInfo.replyCount>2 && (
                        <div className={styles.moreReplies} onClick={()=>viewAllReplies(commentInfo.id)}>
                            <span>{t('viewAllReplies').replace(/\$d/, commentInfo.replyCount+"")}</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.518 6.224a.875.875 0 0 1 1.212.248l3.335 5.05a.875.875 0 0 1 0 .964l-3.334 5.043a.875.875 0 0 1-1.46-.965l3.015-4.56-3.016-4.568a.875.875 0 0 1 .248-1.212Z" clipRule="evenodd"></path></svg>
                        </div>
                    ) }
                </div>
            );
        })
    }, [comments]);

    return (
        <>
            <div className={styles.commentContainer} style={{height: "auto"}} id="commentContainer">
                <ArticleCommentEditor />
                <div className={styles.header}>
                    <div className={styles.title}>{formatNumber(articleInfo.commentCount??0)}条评论</div>
                    <div className={styles.null}></div>
                    <div className={styles.sort}>
                        <div className={classNames(styles.sortDefault, orderBy=='score' ? styles.sortSelected : '')} onClick={()=>changeSort('score')}>默认</div>
                        <div className={classNames(styles.sortNew, orderBy=='createTime' ? styles.sortSelected : '')} onClick={()=>changeSort('createTime')}>最新</div>
                    </div>
                </div>
                <div id="commentImgs">
                <LoaderComp className="w-100" indicatorComp={<Skeleton num={3} height={10} />} loading={!getCommentListQuery.isSuccess || loading}>
                    <CommentListDiv />
                </LoaderComp>
                </div>
                {mode==="drawer" ? 
                    (hasNextPage && (getCommentListQuery.isSuccess && (
                        <div className={styles.commentList} ref={infiniteRef}>
                            {loading ? <Skeleton num={3} height={10} /> : ""}
                        </div>
                    )))
                 : (hasNextPage &&  
                    (<div className={styles.fetchMoreComments} onClick={()=>loadMore(page+1)}>
                        <span>
                            查看更多
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'relative', top: '1px'}}><path fillRule="evenodd" clipRule="evenodd" d="M5.99976 7.93206L10.0656 3.86619C10.1633 3.76856 10.3215 3.76856 10.4192 3.86619L10.7727 4.21975C10.8704 4.31738 10.8704 4.47567 10.7727 4.5733L6.35331 8.99272C6.15805 9.18798 5.84147 9.18798 5.6462 8.99272L1.22679 4.5733C1.12916 4.47567 1.12916 4.31738 1.22679 4.21975L1.58034 3.86619C1.67797 3.76856 1.83626 3.76856 1.93389 3.86619L5.99976 7.93206Z"></path></svg>
                        </span>
                    </div>)
                 )}
                
            </div>
            <ReportComp ref={reportRef} />
            {modal}
        </>
    );
}
export default ArticleComments;

const ArticleCommentEditor = () => {
    const simpleEditorRef = useRef(null);
    return (
        <div className={styles.commentUserEditor}>
            <img className={styles.avatar} src="https://pica.zhimg.com/v2-5cd72e004ec62e6052ebccf7836f26f5_l.jpg?source=32738c0c" />
            <div className="ms-2 w-100" ref={simpleEditorRef}>
                <SimpleEditor showToolBar={false} extraData={{type: 'comment', commentId: 0, replyId: 0}}/>
            </div>
        </div>
    );
};

// 使用正则表达式提取文本和 img 标签
export const extractTextAndImages = (content: string) => {
    const imgRegex = /<img\s+[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
    const parts: (string | JSX.Element)[] = [];

    let lastIndex = 0;
    let match;
  
    while ((match = imgRegex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
  
      // 添加文本部分
      if (start > lastIndex) {
        parts.push(content.slice(lastIndex, start));
      }
  
      // 解析 img 标签的属性
      const imgAttributes = match[0].match(/(\w+)\s*=\s*['"]([^'"]+)['"]/g);
      const src = match[1];
      const alt = imgAttributes?.find(attr => attr.startsWith('alt'))?.split('=')[1]?.replace(/['"]/g, '') || '';
      const width = imgAttributes?.find(attr => attr.startsWith('width'))?.split('=')[1]?.replace(/['"]/g, '') || '';
      const height = imgAttributes?.find(attr => attr.startsWith('height'))?.split('=')[1]?.replace(/['"]/g, '') || '';

      // 添加 Image 组件
      parts.push(
        <PhotoProvider key={src} bannerVisible={true}>
            <PhotoView src={src}>
                <img src={src} alt={alt} width={width} height={height}/>
            </PhotoView>
        </PhotoProvider>
      );
      lastIndex = end;
    }
  
    // 添加剩余的文本部分
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
  
    return parts;
};
  