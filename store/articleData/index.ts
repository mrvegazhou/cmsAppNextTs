import { atom } from "recoil";
import { IArticle, IArticleToolBarData } from '@/interfaces';
import { recoilPersist } from 'recoil-persist'
import type { IImage } from "@/interfaces";

const { persistAtom } = recoilPersist()

export const currentArticleDataContext = atom<IArticle>({
    key: "currentArticleData",
    default: {} as IArticle,
});
  
export const articleToolBarContext = atom<IArticleToolBarData>({
    key: "articleToolBarData",
    default: {} as IArticleToolBarData,
});

export const writeArticleInitValue = {
    id: 0,
    title: "",
    content: "",
    tags: [] as number[],
    typeId: 0,
    coverImage: {name:'', width:0, height:0, tag:'', src:''} as IImage,
    description: null as null | string,
    createTime: null
};
  
export const writeArticleContext = atom({
    key: "writeArticleData",
    default: writeArticleInitValue,
    effects_UNSTABLE: [persistAtom],
});