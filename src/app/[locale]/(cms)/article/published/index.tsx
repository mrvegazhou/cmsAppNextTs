'use client';
import { FC, useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from 'next/link'
import { useRouter } from "next/navigation";
import Header from '@/app/[locale]/_layouts/siteHeader';
import Footer from '@/app/[locale]/_layouts/siteFooter';
import { TMetadata } from '@/types';
import { writeArticleAtom, writeArticleInitValue } from "@/store/articleData";
import { IArticleInit } from "@/interfaces";
import { staticRouter } from "@/lib/constant/router";

interface propsType {
    metadata: TMetadata;
}
const ArticlePublished: FC<propsType> = props => {
    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    const [article, setArticle] = useState<IArticleInit>(articleData);
    const router = useRouter();

    useEffect(() => {
        if (articleData.articleIdStr=="" || 'undefined' == typeof articleData.articleIdStr) {
            router.push(staticRouter.root, {scroll: false});
            return;
        }
        setArticle(articleData);
        setArticleData(writeArticleInitValue);
    }, []);

    return (
        <>
            <Header metadata={props.metadata} canDisappear={false}/>
            <main className="mainBgColor w-100 h-100 d-flex">
                <div className="d-flex flex-column align-items-center bg-white mx-auto" style={{width: "960px", maxWidth: "960px", marginTop: "75px"}}>
                    <div className="text-center" style={{minHeight: "400px", marginLeft: "80px", marginRight: "80px"}}>
                        <div className="mt-4 mb-3 mx-auto" style={{   width: "180px", 
                                                                height: "180px",
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center",
                                                                backgroundRepeat: "no-repeat",
                                                                backgroundImage:"url('https://static.blogweb.cn/avatar/cc788e24a17249d0a8aa6d4567a5460f.webp')"}}>
                        </div>
                        <div className="user-select-none d-flex flex-column justify-content-center align-items-center">
                            <Link className="text-decoration-none fs-5 fw-bold" href={`/article/${article.articleIdStr}`}>《{article.title}》</Link>
                            <div className="fs-6 mt-3">
                                发布成功！有了你的分享，会变得更好！
                            </div> 
                            <Link className="text-decoration-none fw-light mt-3" href="">
                                <small className="d-flex flex-row align-items-center justify-content-center">如何玩转稀土掘金社区？点击了解<i className="iconfont icon-youjiantou" style={{fontSize: "12px"}}></i></small>
                            </Link>
                        </div>
                        <button type="button" className="btn btn-outline-primary mt-5">回到首页</button>
                    </div> 
                    <div className="position-relative mb-5" style={{width: "650px", margin: "70px auto 0"}}>
                        <img style={{width: '100%', height: '190px'}} src="//lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/img/banner-download-app.1431427.png" alt="下载掘金APP" className="banner-image" />
                        <button type="button" className="btn-close position-absolute"
                        style={{top: '57px', right: '4px', width: '20px', height: '20px', backgroundColor: 'transparent'}}></button>
                    </div>
                </div>
            </main>
            <Footer metadata={props.metadata} />
        </>
    );
};
export default ArticlePublished;