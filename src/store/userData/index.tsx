import type { IUser } from "@/interfaces";
import { getUserInfo } from "@/services/api";
import type { IData } from '@/interfaces';
import { atomWithStorage } from 'jotai/utils'
import { atomWithQuery } from "jotai-tanstack-query";


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