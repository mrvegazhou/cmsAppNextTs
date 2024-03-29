'use client';

import { useState, useEffect } from "react"
import classNames from "classnames";
import { useAtom, useAtomValue } from 'jotai'
import useToast from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { itemClassName, iconClassName, DivDom } from "./class";
import { userDataAtom } from "@/store/userData";
import { currentArticleDataAtom, articleToolBarAtom } from '@/store/articleData';
import { doArticleLike, doArticleUnlike } from "@/services/api";
import BadgeComp from '@/components/badge/badge';

const Likes = () => {
    const { show } = useToast();
    const t = useTranslations('ArticleIdPage');

    let userData = useAtomValue(userDataAtom);
    let [currentArticleData, setCurrentArticleData] = useAtom(currentArticleDataAtom);
    let [articleToolBarData, setArticleToolBarData] = useAtom(articleToolBarAtom);
    const [hasLike, setHasLike] = useState<boolean>(false);
    const [iconColor, setIconColor] = useState<string>("text-secondary");

    useEffect(() => {
        if( !articleToolBarData.isLiked ) {
            setIconColor("text-secondary");
        } else {
            setIconColor("text-danger");
        }
        setCurrentArticleData({...currentArticleData, likeCount:999});
    }, [articleToolBarData]);

    const likeArticle = () => {
        if(!userData?.id) {
            show({
                type: 'DANGER',
                message: t('notLogged'),
            });
            return;
        }
        setHasLike(true);
        setArticleToolBarData({...articleToolBarData, isLiked:true});
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
    };

    const unLikeArticle = () => {
        if(!userData?.id) {
            show({
                type: 'DANGER',
                message: t('notLogged'),
            });
            return;
        }
        setHasLike(false);
        setArticleToolBarData({...articleToolBarData, isLiked:false});
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
    };

    return (
        <>
          <DivDom className={classNames([itemClassName])} onClick={hasLike ? unLikeArticle : likeArticle}>
            <BadgeComp count={currentArticleData.likeCount} style={{top:-20, left:30, backgroundColor:'rgba(var(--bs-secondary-rgb), 0.8)'}}>
                <i className={classNames([iconClassName, "icon-like-o", iconColor])}></i>
            </BadgeComp>
          </DivDom>
        </>
    );
};
export default Likes;