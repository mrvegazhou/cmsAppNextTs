'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { articleIdAtom } from '@/store/articleData';
import Sidebar from "@/app/[locale]/(cms)/article/sideBar/sideBar";
import { isNullAndUnDef } from '@/lib/is';


export default function ArticleIdPage({ metadata, articleInfo }: { metadata: TMetadata; articleInfo: IArticle; }) {
    const setCurrentArticleInfo = useSetAtom(currentArticleDataAtom);

    useEffect(() => {
        setCurrentArticleInfo(articleInfo);
    }, []);

    return (
        <>
          <Header metadata={metadata} />
          <ArticleId metadata={metadata} articleInfo={articleInfo} />
          <Footer metadata={metadata} />
        </>
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

    return (
        <>
            <main className="mainBgColor px-0 pt-3 w-100 d-flex justify-content-center" style={{marginTop:"50px"}}>
                <ToolBar />
                <div className="w-100 px-3" style={{backgroundColor:'rgba(255,255,255,1)',maxWidth:'910px'}}>
                    <article className=''>
                        <h5 className="text-start">h1 Bootstrap 标题</h5>
                        <div className='mb-4 d-flex align-items-center justify-content-between'>
                            <div className="d-flex flex-row align-items-center justify-content-left">
                                <img className="bg-info rounded-circle shadow-4" style={{ width: "40px", height: "40px"}} src="https://tse4-mm.cn.bing.net/th/id/OIP-C.o_Pt56TNlPffJc4mBRoufQHaE8?rs=1&pid=ImgDetMain" alt="作者站长头像" />
                                <div className="ms-3 small">
                                    <div>站长</div>
                                    <div className='text-nowrap'>
                                        <time>2022年12月17日 10:56</time>
                                        <span> · 阅读数39</span>
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="bg-white small border-primary border rounded cursor-pointer p-1" style={{ width: "60px"}}>
                                <span className='text-primary'>+关注</span>
                            </button>
                        </div>
                        <div className={classNames(styles.contentBody)} id='articleContent' ref={navContent}>
<h1 style={{marginBottom: '500px'}}>(H1标题1)</h1>
xxxdd11






<h1 style={{marginBottom: '500px'}}>(H1标题1)</h1>
xxxdd11



                        </div>
                    </article>
                </div>
                <Sidebar navContent={navContent}/>
            </main>
            {/* <BackTopPage /> */}
        </>
    )
};