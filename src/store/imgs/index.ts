import { IImage } from '@/interfaces';
import { atom } from 'jotai'

export const imgInfoAtom = atom<IImage>({} as IImage);