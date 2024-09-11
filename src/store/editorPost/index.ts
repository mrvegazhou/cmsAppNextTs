import { IPostTypeVal } from '@/interfaces';
import { atom } from 'jotai'


export const postTypeValAtom = atom<IPostTypeVal>({ type: "comment" } as IPostTypeVal);