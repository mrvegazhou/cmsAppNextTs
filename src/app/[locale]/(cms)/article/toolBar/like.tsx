'use client';
import { useState, useEffect } from "react"
import classNames from "classnames";
import { useAtom, useAtomValue } from 'jotai'
import useToast from '@/hooks/useToast';
import { debounce } from "lodash-es"
import { useTranslations } from 'next-intl';
import dynamic from "next/dynamic";
import { itemClassName, iconClassName, DivDom } from "./class";
import { userDataAtom } from "@/store/userData";
import { IArticleToolBarData } from '@/interfaces';
import { currentArticleDataAtom, articleToolBarAtom } from '@/store/articleData';
import { doArticleLike, doArticleUnlike } from "@/services/api";
const BadgeComp = dynamic(() => import("@/components/badge/badge"), {
    ssr: false,
});

const Likes = () => {
    const { show } = useToast();
    const t = useTranslations('ArticleIdPage');

    let userData = useAtomValue(userDataAtom);
    let [currentArticleData, setCurrentArticleData] = useAtom(currentArticleDataAtom);
    let [articleToolBarData, setArticleToolBarData] = useAtom(articleToolBarAtom);
    const [hasLike, setHasLike] = useState<boolean>(false);
    const [doing, setDoing] = useState<boolean>(false);

    useEffect(() => {
        if (articleToolBarData.isLiked) {
            setHasLike(true);
        }
    }, []);

    const doLike = () => {
        debounce(() => {
            setDoing(true);
            if(!userData?.id) {
                show({
                    type: 'DANGER',
                    message: t('notLogged'),
                });
                return;
            }
            let likeCount = articleToolBarData.likeCount;
            if (hasLike) {
                likeCount -= 1;
                setHasLike(false);
                setArticleToolBarData({...articleToolBarData, isLiked:false, likeCount: likeCount<0 ? 0 : likeCount});
                doArticleUnlike({data: {articleId: currentArticleData.id}}).then(() => {
                    setCurrentArticleData(_data => ({
                    ..._data,
                    likeCount: _data.likeCount! - 1
                    }));
                }).catch(() => {
                    show({
                        type: 'DANGER',
                        message: t('cancelLikeErr'),
                    });
                    return;
                });
            } else {
                likeCount += 1;
                setHasLike(true);
                setArticleToolBarData({...articleToolBarData, isLiked:true, likeCount: likeCount});
                doArticleLike({data: {articleId: currentArticleData.id}}).then(() => {
                    setCurrentArticleData(_data => ({
                    ..._data,
                    likeCount: _data.likeCount! + 1
                    }));
                }).catch(() => {
                    show({
                        type: 'DANGER',
                        message: t('likeArticleErr'),
                    });
                    return;
                });
            }
            setDoing(false);
        }, 500)();
    };

    return (
        <>
          <DivDom className={classNames([itemClassName], {'pe-none': doing})} onClick={doLike}>
            <BadgeComp count={articleToolBarData.likeCount} style={{top:-20, left:30, backgroundColor:'rgba(var(--bs-secondary-rgb), 0.8)'}}>
                <i className={classNames([iconClassName, "icon-like-o", hasLike ? 'text-danger' : 'text-secondary'])}></i>
            </BadgeComp>
          </DivDom>
        </>
    );
};
export default Likes;