'use client';
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";
import parse from 'html-react-parser';
import CreateCatalog from "@/components/catalogNavbar";
import "@/components/catalogNavbar/index.css";
import { useTranslations } from 'next-intl';

const ArticleCatalog = (props: {init: boolean}) => {
    const t = useTranslations('ArticleEditPage');
    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    const [isSetCatalog, setIsSetCatalog] = useState<boolean>(false);
    
    useEffect(() => {
        var div = document.createElement('DIV');
        div.innerHTML = articleData.content; 
        let catalog = new CreateCatalog({
          contentEl: div,
          catelogEl: 'catelogList',
          linkClass: 'cms-catelog-link',
          linkActiveClass: 'cms-catelog-link-active',
          supplyTop: 20,
          selector: ['h1', 'h2', 'h3'],
          active: function (el: HTMLElement) {
          }
        });
        catalog.rebuild();

        // 如果需要初始化
        props.init && setIsSetCatalog(articleData.isSetCatalog==1 ? true : false);
    }, []);

    const setCatalog = () => {
        let val = !isSetCatalog
        setIsSetCatalog(val);
        setArticleData(prev => {
            return {...prev, ...{isSetCatalog: val==true ? 1 : 0}}
        });
    };

    return (
        <>
            <div className="form-check d-flex align-content-center ">
                <input className="form-check-input me-3" type="checkbox" value="1" checked={isSetCatalog} onChange={setCatalog}/>
                <div className="vr me-3"></div>
                <a className="text-decoration-none text-primary cursor-pointer" data-bs-toggle="offcanvas" href="#offcanvasCatalog">
                    <small>{t('check')}</small>
                </a>
            </div>
            <div className="offcanvas offcanvas-start" id="offcanvasCatalog">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasExampleLabel">{t('articleTitle')}</h5>
                    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div id="catelogList"></div>
                </div>
            </div>
        </>
    );
};

export default ArticleCatalog;