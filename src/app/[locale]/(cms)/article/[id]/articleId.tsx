'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query';
import { currentArticleDataAtom, articleToolBarAtom } from '@/store/articleData';
import useToast from '@/hooks/useToast';
import Header from '@/app/[locale]/_layouts/siteHeader';
import Footer from '@/app/[locale]/_layouts/siteFooter';
import { TBody } from '@/types';
import type { TMetadata } from '@/types';
import classNames from 'classnames';
import styles from './articleId.module.scss'
// import BackTopPage from '../../_common/backTop';
import ToolBar from '../toolBar';
import { IArticle, IArticleToolBarData, IData, IArticleId } from '@/interfaces';
import { getArticleToolBarData } from '@/services/api';
import Sidebar from "@/app/[locale]/(cms)/article/sideBar/sideBar";
import ArticleComments, {extractTextAndImages} from '../comments';
import { isNullAndUnDef } from '@/lib/is';
import ImagePreview from '@/app/[locale]/_common/imagePreview';

export default function ArticleIdPage({ metadata, articleInfo }: { metadata: TMetadata; articleInfo: IArticle; }) {
    const setCurrentArticleInfo = useSetAtom(currentArticleDataAtom);

    useEffect(() => {
        setCurrentArticleInfo(articleInfo);
    }, []);

    return (
        <div className=''>
            <Header metadata={metadata} />
            <ArticleId metadata={metadata} articleInfo={articleInfo} />
            <Suspense>
                <ImagePreview />
            </Suspense>
            <Footer metadata={metadata} />
        </div>
    );
}

const ArticleId = ({ metadata, articleInfo }: { metadata: TMetadata; articleInfo: IArticle }) => {
    const { show } = useToast();

    const navContent = useRef<HTMLDivElement>(null);

    const setArticleToolBarData = useSetAtom(articleToolBarAtom);

    const getToolBarMutation = useMutation({
        mutationFn: async (variables: TBody<IArticleId>) => {
          return await getArticleToolBarData(variables) as IData<IArticleToolBarData>;
        }
    });
    
    useEffect(() => {
        if (!isNullAndUnDef(articleInfo.id)) {
            getToolBarMutation.mutateAsync({ data: {articleId: articleInfo.id} }).then(res => {
                if (res.status==200) {
                    let data = res.data;
                    setArticleToolBarData(pre => {
                        return { ...pre, 
                            likeCount: data.likeCount, 
                            commentCount: data.commentCount, 
                            collectionCount: data.collectionCount,
                            shareCount: data.shareCount,
                            isLiked: data.isLiked,
                            isCollected: data.isCollected,
                            favorites: data.favorites,
                            isReport: data.isReport
                        };
                    });
                }
            });
        }
    }, [])

    // 滚动到评论隐藏目录
    const [isCatalogueVisible, setIsCatalogueVisible] = useState(true);
    const commentContainerRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
                setIsCatalogueVisible(false);
            } else {
                setIsCatalogueVisible(true);
            }
          });
        }, {
          root: null,
          rootMargin: '0px',
          threshold: 0.0
        });
    
        if (commentContainerRef.current) {
          observer.observe(commentContainerRef.current);
        }
    
        return () => {
          if (commentContainerRef.current) {
            observer.unobserve(commentContainerRef.current);
          }
        };
    }, []);

    const parseHTML = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        console.log(doc, "--d--")
        return doc;
    };

    return (
        <>
            <main className={classNames(styles.mainContainer)}>
                <div className={styles.view}>
                    <div className={styles.aritcleArea}>
                        <article className={styles.article}>
                            <p className={styles.articleTitle}>完整过一遍axios，再也不怕写请求</p>
                            <div className={styles.authorInfoBlock}>
                                <div className={styles.authorInfoBox}>
                                    <div className={styles.authorName}>
                                        <a target="_blank" rel="" className={styles.username}>
                                            Benjamin59
                                        </a>
                                    </div> 
                                    <div className={styles.metaBox}>
                                        <time dateTime="2021-11-26T10:44:21.000Z" title="Fri Nov 26 2021 18:44:21 GMT+0800 (中国标准时间)" className={styles.time}>
                                            2021-11-26
                                        </time> 
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="read-icon"><path d="M7.90078 2.80078C4.49278 2.80078 1.74745 6.11672 0.800781 7.77469C1.74745 9.58339 4.49278 13.2008 7.90078 13.2008C11.3088 13.2008 14.0541 9.58339 15.0008 7.77469C14.0541 6.11672 11.3088 2.80078 7.90078 2.80078Z" stroke="currentColor"></path><circle cx="7.89922" cy="8.00078" r="2.2" stroke="currentColor"></circle></svg> 
                                        <span className={styles.viewsCount}>
                                            58,542
                                        </span> 
                                        <span className={styles.readTime}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className=""><rect width="16" height="16" fill="none"></rect><circle cx="8" cy="8" r="5.65625" stroke="#8A919F"></circle><path d="M7.69141 5.18652V8.30924H10.8141" stroke="#8A919F" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                            阅读6分钟
                                        </span>
                                    </div>
                                </div> 
                                <div style={{flex: '1'}}></div>
                            </div>
                            <div className={styles.articleViewer} id="articleCententView">
                                这里是文章
                                整体布局
ziplist没有结构体定义, 官方文档描述其为: 一种特殊结构的双向链表。其特殊之处在, 没有使用双向指针(prev, next)去连接前后的元素, 而是通过计算元素中特定编码的字长偏移量来访问不同的元素, 借助源码src/ziplist.c 中的注释描述:
<img src="https://static.blogweb.cn/article/f3ed26ee957944ada15fe93969811048.webp" loading="lazy" alt="【Redis源码系列】Redis6.0数据结构详解--ziplist篇"></img>
    【Redis源码系列】Redis6.0数据结构详解--ziplist篇

    我们可以了解到典型的压缩列表布局为:


                            </div>
                        </article>
                        <div className={styles.articleEnd}>
                            <div className={styles.tagList}>
                                <div className={styles.tagListTitle}>标签：</div> 
                                <div className={styles.tagListContainer}>
                                    <a href="" target="_blank" rel="" className={styles.tagItem}>
                                        <span className={styles.tagTitle}>前端</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className={styles.commentContainer} ref={commentContainerRef}>
                            <ArticleComments mode="common" />
                        </div>
                    </div>
                    <div className={styles.rightSideBarContainer}>
                        <Sidebar isShowCatalogue={isCatalogueVisible}/>
                    </div>
                    <div className={styles.leftSideBarContainer}>
                        <ToolBar />
                    </div>
                    <div className={styles.recommendedArea}>
                        <div className={styles.recommendedTitle}>
                            <span className={styles.title}>为你推荐</span>
                        </div>
                        <div className={styles.recommendedList}>
                            <div className={styles.recommendedItem}>

                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 评论的表情层 */}
            <div id='hideCommentEmoji'></div>
        </>
    )
};