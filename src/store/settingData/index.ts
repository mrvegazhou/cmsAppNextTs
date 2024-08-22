import { atom } from "jotai";
import { defaultLocale, locales } from '@/lib/constant/locales';
import { TMetadata } from "@/types";
import Metadata from '@/lib/metadata';

interface LocaleData {
    defaultLocale: string;
    locales: string[];
}

export const userDataState = atom<LocaleData>({defaultLocale, locales} as LocaleData);

const metadata = new Metadata();
export const metadataAtom = atom<TMetadata>(metadata);