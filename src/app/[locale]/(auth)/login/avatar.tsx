import { type MouseEvent, FC, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import useToast from '@/hooks/useToast';
import { logout } from '@/services/api';
import { userDataAtom } from "@/store/userData";
import { useAtom } from 'jotai'

import { useRouter, useParams } from "next/navigation";
import { IData } from '@/interfaces';
import { USER_TOKEN } from '@/lib/constant';
import { REFRESH_TOKEN_BUFFER } from '@/lib/constant/app';
import { decodeJwtExpToSeconds } from '@/lib/tool';
import { refreshToken } from '@/services/api';

interface propsType {
    class?: string;
}
const Avatar: FC<propsType> = props => {
    let [userData, setUserData] = useAtom(userDataAtom);

    const t = useTranslations('Navbar');
    const { show } = useToast();

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await logout({});
        }
    });
    const logoutOnClick = useCallback(async (e: MouseEvent<HTMLAnchorElement>) => {
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
    }, []);

    const router = useRouter();
    const params = useParams();

    // refresh token
    const validateTokens = useCallback(
        async (reToken: string) => {
            if (reToken) {
                const res = await refreshToken({
                    data: { refreshToken: reToken }
                }) as IData<any>;
                console.log(res, '==s==');
                
                if (res.status != 200) {
                    const locale = params.locale;
                    let path = '/login';
                    if (locale != 'undefined' && locale != "") {
                        path = `/${locale}/login`;
                    }
                    router.push(path);
                } else {
                    // 更新token
                    const token = res.data.token;
                    const refreshToken = res.data.refreshToken;
                    if ( token!="" && refreshToken!="" ) {
                        USER_TOKEN.set({token, refreshToken})
                    }
                }
            }
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const JWT = USER_TOKEN.get();
        const token = JWT.token;
        const retoken = JWT.refreshToken;
        if ((token != 'undefined' && retoken != 'undefined') && (token && retoken)) {
            // token过期时间与当前时间相差多少秒
            const tokenSeconds = decodeJwtExpToSeconds(token);
            if (!tokenSeconds || tokenSeconds <= 0) {
                validateTokens(retoken);
            } else {
                // 加了定时器去自动更新token 是否有必要？
                const timeToExpire = tokenSeconds - REFRESH_TOKEN_BUFFER;
                timer = setTimeout(() => {
                    validateTokens(retoken);
                }, Math.max(0, timeToExpire));
            }
        }
        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <div className={classNames(props.class, "dropdown")}>
                <a href="#" role="button" id="dropdownLoginLink" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={userData?.avatarUrl} loading="lazy" className="bg-info rounded-circle shadow-4" style={{ width: "35px" }} />
                </a>
                <ul className="dropdown-menu" aria-labelledby="dropdownLoginLink" style={{ left: "auto", right: 0 }}>
                    <li><a className="dropdown-item" href="#"><i className="iconfont icon-gerenzhongxin fs-6 pe-2" />{t('profile')}</a></li>
                    <li><hr className="dropdown-divider opacity-50 mx-2" /></li>
                    <li><a className="dropdown-item" href="#" onClick={logoutOnClick}><i className="iconfont icon-tuichu fs-6 pe-2" />{t('logout')}</a></li>
                </ul>
            </div>
        </>
    );
};

export default Avatar;