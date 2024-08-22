import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { USER_TOKEN } from '@/lib/constant';
import { staticRouter } from '@/lib/constant/router';
import { useAtom } from 'jotai'
// import { userDataAtom } from "@/store/userData";
import { LoginModal } from '../../(auth)/login/loginNav';
import LoadPage from '../load/load';
import { loginAtom } from '@/store/userData';

function RouteGuard({ children, locale, back, popLogin }: { children: ReactNode; locale: string; back?: string; popLogin?: boolean;}) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(true);
    const loginURL = `/${locale}/${staticRouter.login}`;
    const [loading, setLoading] = useState(true);  
    const [loginIdent, setLoginIdent] = useAtom(loginAtom);

    useEffect(() => {
        authCheck(pathname);
    }, []);

    const authCheck = (url: string) => {
        const publicPaths = [loginURL];
        const path = url.split('?')[0];
        setLoginIdent(true);
        console.log(loginIdent,'--loginIdent-xxx')
        return
        if (!USER_TOKEN.get().token && !publicPaths.includes(path)) {
            setAuthorized(false);
            // 如果是弹窗登录框
            if (!popLogin) {
                let goURL = back!="" ? loginURL+"?back="+back : loginURL;
                router.push(goURL, { scroll: false });
            } else {
                setLoginIdent(true);
            }
        } else {
            setAuthorized(true);
        }
        setLoading(false);
    }

    if (loading && !popLogin) {
        return <><LoadPage /></>
    } else {
        return authorized ? <>{children}</> : <></>;
    }
    
}

export default RouteGuard;