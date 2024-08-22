'use client';
import { useState, useEffect } from "react"
import classNames from "classnames";
import { useAtom, useAtomValue } from 'jotai'
import { currentArticleDataAtom, articleToolBarAtom } from '@/store/articleData';
import { itemClassName, iconClassName, DivDom } from "./class";

const Report = () => {

    let [articleToolBarData, setArticleToolBarData] = useAtom(articleToolBarAtom);
    const [hasReport, setHasReport] = useState<boolean>(false);

    useEffect(() => {
        if (articleToolBarData.isReport) {
            setHasReport(true);
        }
    }, []);

    const doReport = () => {
        if (hasReport) {

        } else {

        }
    };
    
    return (
        <>
          <DivDom className={classNames([itemClassName])} onClick={doReport}>
            <i className={classNames([iconClassName, "icon-like-o", hasReport ? '' : 'text-secondary'])}></i>
          </DivDom>
        </>
    );
};
export default Report;