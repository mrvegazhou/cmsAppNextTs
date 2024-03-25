"use client";
import { useEffect, useCallback, FC, useState } from "react";
import { RESET } from "jotai/utils";
import { useAtom } from "jotai";
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { writeArticleAtom } from "@/store/articleData";

interface propsType {
    class: string;
    clearFn: Function;
    isEmpty: boolean;
}

const ClearEditor: FC<propsType> = props => {
    const t = useTranslations('ArticleEditPage');

    const [, setArticleData] = useAtom(writeArticleAtom);
    
    const clearEditorClick = useCallback(() => {
        const clear = props.clearFn;
        if ( typeof clear === 'function' ) {
            clear();
            setArticleData(RESET);
        }
    }, [props.clearFn, setArticleData]);

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