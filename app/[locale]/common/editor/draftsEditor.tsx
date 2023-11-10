"use client";
import { useState, useMemo, FC } from "react";
import { useRecoilValue } from "recoil";
import { useTranslations } from 'use-intl';
import classNames from 'classnames';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { writeArticleContext } from "@/store/articleData";

interface propsType {
    class: string;
}

const DraftsEditor: FC<propsType> = props => {
    const t = useTranslations('ArticleEditPage');
    let router = useRouter();
    let searchParams = useSearchParams();
    let pathname = usePathname();

    let article = useRecoilValue(writeArticleContext);

    /** 判断按钮是否禁止点击*/
    let isDisabled = useMemo(() => {
        return (
            !/^[\s\S]*.*[^\s][\s\S]*$/.test(article.title) ||
            article.title.length > 199 ||
            article.content.length < 20 ||
            article.tags.length == 0
        );
    }, [article.title, article.content, article.tags]);

    let [isLoad, setIsLoad] = useState(false);

    function createDrafts() {
        if (isDisabled) {
            return;
        }
        setIsLoad(true);

    }

    function updateDrafts() {
        if (isDisabled) {
            return;
        }
        setIsLoad(true);

    }

    return (
        <>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary")}
                onClick={pathname == "/article/editor" ? createDrafts : updateDrafts}
                disabled={isDisabled}
                title={isDisabled ? t('saveDraftsErr') : undefined}
            >
                <small>{t('saveToDrafts')}</small>
            </button>
        </>
    );
}
export default DraftsEditor;