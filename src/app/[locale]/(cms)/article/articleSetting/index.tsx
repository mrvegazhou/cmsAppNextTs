'use client';
import { useState, useEffect } from "react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAtom } from "jotai";
import { writeArticleAtom } from "@/store/articleData";
import ArticleTag from "../articleTag";
import ArticleType from "../aritcleType";
import ArticleCover from "../articleCover";
import { debounce } from "lodash"
import ArticleCatalog from "../aritcleCatalog";

const ArticleSetting = (props: {}) => {
    const [articleData, setArticleData] = useAtom(writeArticleAtom);

    const [desc, setDesc] = useState<string>(articleData.description);

    const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let val = e.target.value;
        setDesc(val);
        debounce(() => {
            setArticleData(pre => {
                return {...pre, ...{description: val}};
            });
        }, 500)();
    };

    return (
        <>
            <div className="card mx-auto my-5" style={{ maxWidth: '1000px' }}>
                <div className="card-header">
                    设置
                </div>
                <div className="card-body mb-3">
                    <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
                    <div className="col-2 text-end">
                        生成目录
                    </div>
                    <div className="col-10">
                        <ArticleCatalog init={true}/>
                    </div>
                    </div>
                    <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
                    <div className="col-2 text-end">
                        封面
                    </div>
                    <div className="col-10">
                        <ArticleCover init={true} />
                    </div>
                    </div>
                    <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
                    <div className="col-2 text-end">
                        <span className="text-danger">*</span>分类
                    </div>
                    <div className="col-10">
                        <div className="d-flex text-muted">
                        <ArticleType init={true} />
                        </div>
                    </div>
                    </div>
                    <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
                    <div className="col-2 text-end">
                        <span className="text-danger">*</span>标签
                    </div>
                    <div className="col-10">
                        <div className="d-flex text-muted flex-wrap">
                        <ArticleTag init={true} />
                        </div>
                    </div>
                    </div>
                    <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
                    <div className="col-2 text-end">
                        摘要
                    </div>
                    <div className="col-10">
                        <textarea className="form-control" style={{ height: '100px', maxWidth: '600px' }} value={desc} onChange={handleDescription}></textarea>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleSetting;