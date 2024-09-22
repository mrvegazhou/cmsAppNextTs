'use client';
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";
import CreateCatalog from "@/components/catalogNavbar";
import Drawer from "@/components/drawer";
import "@/components/catalogNavbar/index.css";
import { useTranslations } from 'next-intl';
import { isNullOrUnDefOrEmpty } from "@/lib/is";

const ArticleCatalog = (props: {init: boolean}) => {
    const t = useTranslations('ArticleEditPage');
    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    const [isSetCatalog, setIsSetCatalog] = useState<boolean>(false);
    
    const rebuildCatalog = () => {
        if (!isNullOrUnDefOrEmpty(articleData.content)) {
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
        }
    };
    useEffect(() => {
        rebuildCatalog();

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

    const [catalogVisible, setCatalogVisible] = useState(false);
    const toggleCatalogVisible = () => {
        setCatalogVisible(!catalogVisible);
    };

    return (
        <>
            <div className="form-check d-flex align-content-center ">
                <input className="form-check-input me-3" type="checkbox" value="1" checked={isSetCatalog} onChange={setCatalog}/>
                <div className="vr me-3"></div>
                <a className="text-decoration-none text-primary cursor-pointer" onClick={()=>{rebuildCatalog();toggleCatalogVisible();}}>
                    <small>{t('check')}</small>
                </a>
            </div>
            <Drawer
                title={t('articleTitle')}
                isOpen={catalogVisible}
                onClose={()=>setCatalogVisible}
                size={500}
                hasBackdrop={false}
                usePortal={false}
                hasOverLay={false}
                placement="left"
            >
                <div id="catelogList"></div>
            </Drawer>
        </>
    );
};

export default ArticleCatalog;