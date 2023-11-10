"use client";
import { useState, useMemo, FC } from "react";
import { useRecoilValue } from "recoil";
import { useTranslations } from 'use-intl';
import classNames from 'classnames';

interface propsType {
    class: string;
}

interface propsType {
    class: string;
}

const SaveEditor: FC<propsType> = props => {
    const t = useTranslations('ArticleEditPage');

    return (
        <>
            <button type="button" className={classNames(props.class, "btn btn-outline-primary")}
            >
                <small>{t('saveArticle')}</small>
            </button>
        </>
    );
}
export default SaveEditor;