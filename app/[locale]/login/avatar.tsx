import { type MouseEvent } from 'react';
import { useTranslations } from 'use-intl';
import { useMutation } from '@tanstack/react-query';
import useToast from '@/hooks/useToast';
import { logout } from '@/services/api';
import { useRecoilState } from "recoil";
import { userDataContext } from "@/store/userData";

const Avatar = () => {
    let [userData, setUserData] = useRecoilState(userDataContext);

    const t = useTranslations('Navbar');
    const { show } = useToast();

    const logoutMutation = useMutation(async () => {
        await logout({});
    });
    const logoutOnClick = async (e: MouseEvent<HTMLAnchorElement>)=>{
        try {
            e.stopPropagation();
            e.preventDefault();
            await logoutMutation.mutateAsync();
            show({
                type: 'SUCCESS',
                message: t('logoutCompleted'),
            });
            setUserData(null);
        } catch (e) {
            logoutMutation.reset();
            show({
                type: 'DANGER',
                message: e,
            });
        }
    }
    return (
        <>
            <div className="dropdown">
                <a href="#" role="button" id="dropdownLoginLink" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={userData?.avatarUrl} loading="lazy" className="bg-info rounded-circle shadow-4" style={{ width: "35px"}} />
                </a>
                <ul className="dropdown-menu" aria-labelledby="dropdownLoginLink" style={{left:"auto", right: 0}}>
                    <li><a className="dropdown-item" href="#"><i className="iconfont icon-gerenzhongxin fs-6 pe-2" />{t('profile')}</a></li>
                    <li><a className="dropdown-item" href="#" onClick={logoutOnClick}><i className="iconfont icon-tuichu fs-6 pe-2" />{t('logout')}</a></li>
                </ul>
            </div>
        </>
    );
};

export default Avatar;