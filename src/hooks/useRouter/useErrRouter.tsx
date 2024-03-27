import { useRouter } from 'next/navigation';
import { staticRouter } from '@/lib/constant/router';

const useErrRouter = (err: string) => {
    const router = useRouter();
    if (err.startsWith("err")) {
        router.push(staticRouter.errPage);
    } else if (err.startsWith("401")) {
        router.push(staticRouter.errPage);
    } 
}

export default useErrRouter;