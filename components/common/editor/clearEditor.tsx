"use client";
import { useEffect, useCallback, FC, useState } from "react";
import { useResetRecoilState } from "recoil";
import { useTranslations } from 'use-intl';
import classNames from 'classnames';
import { writeArticleContext } from "@/store/articleData";

interface propsType {
    class: string;
    clearFn: Function;
    isEmpty: boolean;
}

const ClearEditor: FC<propsType> = props => {
    const t = useTranslations('ArticleEditPage');

    const resetArticle = useResetRecoilState(writeArticleContext);
    
    const clearEditorClick = useCallback(() => {
        const clear = props.clearFn;
        if ( typeof clear === 'function' ) {
            clear();
            resetArticle();
        }
    }, [props.clearFn, resetArticle]);

    return (
        <>
            <button type="button" className={classNames(props.class, "btn btn-outline-danger")}
                onClick={() => clearEditorClick()}
                disabled={props.isEmpty}
            >
                <small>{t('clearEditor')}</small>
            </button>
        </>
    );
}
export default ClearEditor;