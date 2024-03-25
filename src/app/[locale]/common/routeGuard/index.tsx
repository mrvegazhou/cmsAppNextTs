import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { USER_TOKEN } from '@/lib/constant';
import { staticRouter } from '@/lib/constant/router';
// import { useAtom, useSetAtom } from 'jotai'
// import { userDataAtom } from "@/store/userData";
import LoadPage from '../load/load';

function RouteGuard({ children, locale, back }: { children: ReactNode; locale: string; back?: string; }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(true);
    const loginURL = `/${locale}/${staticRouter.login}`;
    const [loading, setLoading] = useState(true);  

    useEffect(() => {
        authCheck(pathname);
    }, []);

    const authCheck = (url: string) => {
        const publicPaths = [loginURL];
        const path = url.split('?')[0];
        if (!USER_TOKEN.get().token && !publicPaths.includes(path)) {
            setAuthorized(false);
            let goURL = back!="" ? loginURL+"?back="+back : loginURL;
            router.push(goURL, { scroll: false });
        } else {
            setAuthorized(true);
        }
        setLoading(false);
    }

    if (loading) {
        return <><LoadPage /></>
    } else {
        return authorized ? <>{children}</> : <></>;
    }
    
}

export default RouteGuard;