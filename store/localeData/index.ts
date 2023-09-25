import { atom } from "recoil";
import type { ILocale } from "@/interfaces/data";

export const userDataState = atom<ILocale>({
    key: "localeData",
    default: { locale: "zh" },
});