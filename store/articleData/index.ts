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

export const writeArticleInitValue = {
    title: "",
    content: "",
    tags: [] as number[],
    coverUrl: null as null | string,
    description: null as null | string,
};
  
export const writeArticleContext = atom({
    key: "writeArticleData",
    default: writeArticleInitValue,
});