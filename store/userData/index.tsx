import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import type { IUser } from "@/interfaces";
import { getUserInfo } from "@/services/api";
import type { IData } from '@/interfaces';

export const userDataContext = atom<IUser | null>({
    key: "userData",
    default: null,
});

/**
 * @params [userData, refreshUserData] {[object,function]} 用户信息，刷新用户信息
 */
function useUserData() {
    let [userData, setUserData] = useRecoilState(userDataContext);
    function refreshUserData() {
      getUserInfo().then(res => {
        let resData = res as IData<IUser>;
        if (resData.code==200) {
          setUserData(resData.data);
        } else {
          setUserData(null);
        }
      });
    }
  
    useEffect(() => {
      if (!userData) refreshUserData();
    }, [userData]);
    return [userData, refreshUserData] as [IUser | null, () => void];
}
  
export default useUserData;