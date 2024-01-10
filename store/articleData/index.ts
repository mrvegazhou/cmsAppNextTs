import { atom } from "recoil";
import { IArticle, IArticleToolBarData } from '@/interfaces';
import { recoilPersist } from 'recoil-persist'
import type { IImage, ITag } from "@/interfaces";

const { persistAtom } = recoilPersist()

export const currentArticleDataContext = atom<IArticle>({
    key: "currentArticleData",
    default: {} as IArticle,
});
  
export const articleToolBarContext = atom<IArticleToolBarData>({
    key: "articleToolBarData",
    default: {} as IArticleToolBarData,
});

interface IArticleInit {
    id: number | null;
    title: string;
    content: string;
    tags: ITag[];
    typeId: number;
    coverImage: IImage;
    description: string;
    createTime: string | null;
}
export const writeArticleInitValue = {
    id: null,
    title: "",
    content: "",
    tags: [{id:1, name:'fuck'}],
    typeId: 0,
    coverImage: {name:'', width:0, height:0, tag:'', src:''},
    description: "",
    createTime: null
} as IArticleInit;
  
export const writeArticleContext = atom<IArticleInit>({
    key: "writeArticleData",
    default: writeArticleInitValue,
    effects_UNSTABLE: [persistAtom],
});