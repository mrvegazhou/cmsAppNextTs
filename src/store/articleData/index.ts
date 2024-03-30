import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { IArticle, IArticleToolBarData } from '@/interfaces';
import type { ICollabTokenInfo, IArticleInit } from "@/interfaces";
import { IArticleNote, IArticleNoteComment } from '@/types';
import { userDataAtom } from '../userData';

export const currentArticleDataAtom = atom<IArticle>({} as IArticle);


export const articleToolBarAtom = atom<IArticleToolBarData>({} as IArticleToolBarData);

// collab 协同是否连接
export const articleCollabIsConnectedAtom = atom<boolean>(false);

export const initCoverImage = {name:'', width:0, height:0, tag:'', src:''};
export const writeArticleInitValue = {
    id: null,
    title: "",
    content: "",
    tags: [],
    typeId: 0,
    coverImage: initCoverImage,
    description: "",
    createTime: null,
    isSetCatalog: 0
} as IArticleInit;
export const writeArticleAtom = atomWithStorage<IArticleInit>('writeArticleData', writeArticleInitValue);

export const collabTokenInfoAtom = atom<ICollabTokenInfo>({} as ICollabTokenInfo );

// 判断协作过程是否可以操作
export const canEditAtom = atom(
  (get) => {
    const info = get(collabTokenInfoAtom);
    const userInfo = get(userDataAtom);
    if (!userInfo?.id) return false;
    // 如果不是协作状态 返回true
    if (!info.isCollab) return true;
    // 协作状态 并且 作者不是本人
    return info.isCollab && !info.isMe;
  }
)

export type Comments = Array<IArticleNote | IArticleNoteComment>;
export const writeArticleNoteInitValue = [] as Comments;

const defaultStorage = createJSONStorage(() => {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage
        : (undefined as any as Storage);
    } catch (e) {
      return undefined as any as Storage;
    }
});
export const writeArticleNoteAtom = 
    atomWithStorage<Comments>('writeArticleNoteData', writeArticleNoteInitValue, 
    //@ts-ignore
    defaultStorage, 
    {getOnInit: true}
);

