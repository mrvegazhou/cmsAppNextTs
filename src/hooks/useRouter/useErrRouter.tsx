import { useRouter } from 'next/navigation';
import { staticRouter } from '@/lib/constant/router';

const useErrRouter = (err: string) => {
    const router = useRouter();
    const errArr = err.split(":");
    const ident = errArr[0].toLowerCase()
    if (ident=='redirect error') {
        router.push(staticRouter.errPage);
    } else if (ident=='redirect login') {
        router.push(staticRouter.login);
    }
    return;
}