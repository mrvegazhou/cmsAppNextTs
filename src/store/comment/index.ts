import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ICommentList } from '@/interfaces';

export const emojisAtom = atomWithStorage<string[]>('emojisData', []);
export const commentListAtom = atom<ICommentList[]>([]);