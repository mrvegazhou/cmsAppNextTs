'use client';

import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai'
import { currentArticleDataAtom, articleToolBarAtom } from '@/store/articleData';
import useToast from '@/hooks/useToast';
import Header from '@/app/[locale]/_layouts/siteHeader';
import Footer from '@/app/[locale]/_layouts/siteFooter';

import type { TMetadata } from '@/types';
import classNames from 'classnames';
import styles from './articleId.module.scss'
// import BackTopPage from '../../_common/backTop';
import ToolBar from '../toolBar';
import { IArticle, IArticleToolBarData } from '@/interfaces';
import Sidebar from '@/app/[locale]/(cms)/article/sideBar/sideBar';



export default function ArticleIdPage({ metadata, articleInfo, toolBarData }: { metadata: TMetadata; articleInfo:IArticle; toolBarData: IArticleToolBarData }) {
    const setCurrentArticleInfo = useSetAtom(currentArticleDataAtom);
    const setArticleToolBarData = useSetAtom(articleToolBarAtom);

    useEffect(() => {
        setCurrentArticleInfo(articleInfo);
        setArticleToolBarData(toolBarData);
    }, []);

    return (
        <>
          {/* <Header metadata={metadata} /> */}
          {/* <ArticleId metadata={metadata} /> */}
          {/* <Footer metadata={metadata} /> */}
        </>
    );
}

const ArticleId = ({ metadata }: { metadata: TMetadata }) => {
    const { show } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [hasBackdrop, setHasBackdrop] = useState(true);

    const navContent = useRef<HTMLDivElement>(null);

    return (
        <>
            <main className="col px-0 pt-3 w-100 d-flex justify-content-center" style={{marginTop:"50px"}}>
                <ToolBar />
                <div className="w-100 px-3" style={{backgroundColor:'#eee',maxWidth:'910px'}}>
                    <article className=''>
                        <h5 className="text-start">h1 Bootstrap 标题</h5>
                        <div className='mb-4 d-flex align-items-center justify-content-between'>
                            <div className="d-flex flex-row align-items-center justify-content-left">
                                <img className="bg-info rounded-circle shadow-4" style={{ width: "40px"}} src="https://img.blogweb.cn/avatar/144a62f8f4ee43faa0c5a3a231616f22.webp" alt="作者站长头像" />
                                <div className="ms-3">
                                    <div>站长</div>
                                    <div>
                                        <time>2022年12月17日 10:56</time>
                                        <span> · 阅读数39</span>
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="">
                                <span>+关注</span>
                            </button>
                        </div>
                        <div className={classNames(styles.contentBody)} ref={navContent}>


<h1>(H1标题)</h1>
<h2>(H2标题)</h2>
xxxxxx
<div style={{height:"1900px"}}></div>
xxxxxx
<h3>(H3标题)</h3>
xxxxxx
xxxxxx
xxxxxx
xxxxxx
xxxxxx
xxxxxx
<h4>(H4标题)</h4>
xxxxxx
xxxxxx
<h5>(H5标题)</h5>
xxxxxx
xxxxxx
<h6>(H6标题)</h6>
xxxxxx


                            <span className="bg-secondary" id="comment">
                            xxxxx
                            </span>
                        </div>
                    </article>
                </div>
                <Sidebar navContent={navContent}/>
            </main>
            {/* <BackTopPage /> */}
        </>
    )
};