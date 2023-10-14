import { atom } from "recoil";
import { IArticle, IArticleToolBarData } from '@/interfaces';

export const currentArticleDataContext = atom<IArticle>({
    key: "currentArticleData",
    default: {} as IArticle,
});
  
export const articleToolBarContext = atom<IArticleToolBarData>({
    key: "articleToolBarData",
    default: {} as IArticleToolBarData,
});