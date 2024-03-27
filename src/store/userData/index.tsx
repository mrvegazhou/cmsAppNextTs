import type { IUser } from "@/interfaces";
import { getUserInfo } from "@/services/api";
import type { IData } from '@/interfaces';
import { atomWithStorage } from 'jotai/utils'
import { atomWithQuery } from "jotai-tanstack-query";
import { atom } from 'jotai'


export const userDataAtom = atomWithStorage<IUser|null>("userData", {} as IUser);

const useUserData = atomWithQuery(() => ({
  queryKey: ["userInfo"],
  queryFn: async () => {
    const res = await getUserInfo().then(res => {
      let resData = res as IData<IUser>;
      if (resData.status==200) {
        return resData;
      } else {
        return [];
      }
    });
  },
}));
export default useUserData;

// 判断是否需要展示登录
export const loginAtom = atom<boolean>(false);
export const showLoginModal = atom(
  (get) => get(loginAtom),
  (get, set, newValue: string) => {
    if (newValue=='401' || newValue.startsWith('401')) {
      set(loginAtom, true);
    }
  }
)