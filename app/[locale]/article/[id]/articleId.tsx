'use client';

import React,{ useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { currentArticleDataContext, articleToolBarContext } from '@/store/articleData';
import useToast from '@/hooks/useToast';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import type { TMetadata } from '@/types';
import classNames from 'classnames';
import styles from './articleId.module.scss'
import BackTopPage from '../../common/backTop';
import ToolBar from '../toolBar';
import { IArticle, IArticleToolBarData } from '@/interfaces';
import Sidebar from '@/app/[locale]/article/sideBar/sideBar';

const Child = React.memo(() => {
    console.log("子组件 re-render，字体颜色改变");
    const r = Math.ceil(Math.random() * 255);
    const g = Math.ceil(Math.random() * 255);
    const b = Math.ceil(Math.random() * 255);
    return <p style={{ color: 'rgb('+r+','+g+','+b+')' }}>child</p>;
});

export default function ArticleIdPage({ metadata, articleInfo, toolBarData }: { metadata: TMetadata; articleInfo:IArticle; toolBarData: IArticleToolBarData }) {
    // const setCurrentArticleInfo = useSetRecoilState(currentArticleDataContext);
    // const setArticleToolBarData = useSetRecoilState(articleToolBarContext);

    // useEffect(() => {
    //     setCurrentArticleInfo(articleInfo);
    //     setArticleToolBarData(toolBarData);
    // }, []);
    const [count, setCount] = React.useState(0);

    const handleClick = () => {
      setCount(count + 1);
    };
  
    return (
        <>
        <button onClick={handleClick}>Increment Count:{count}</button>

          {/* <NavbarPage metadata={metadata} /> */}
          <div style={{position: 'absolute',width:'50px', height:'50px', backgroundColor:'yellow', top:'100px'}}><Child /></div>
          {/* <ArticleId metadata={metadata} /> */}
          {/* <FooterPage metadata={metadata} /> */}
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
            <BackTopPage />
        </>
    )
};