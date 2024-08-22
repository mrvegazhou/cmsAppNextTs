import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const emojisAtom = atomWithStorage<string[]>('emojisData', []);