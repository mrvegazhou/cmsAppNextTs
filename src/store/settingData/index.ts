import { atom } from "jotai";
import { defaultLocale, locales } from '@/lib/constant/locales';

interface LocaleData {
    defaultLocale: string;
    locales: string[];
}

export const userDataState = atom<LocaleData>({defaultLocale, locales} as LocaleData);