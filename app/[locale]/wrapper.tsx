'use client';

import 'dayjs/locale/en';
import 'dayjs/locale/zh';
import Script from 'next/script';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useState, Suspense } from 'react';
import type Bootstrap from 'bootstrap';
import { AppContext } from '@/contexts/app';
import ToastWrapper from '@/app/[locale]/toast/wrapper';
import ModalWrapper from '@/app/[locale]/modal/wrapper';
import { useLocale } from 'use-intl';
import { RecoilRoot } from "recoil";

import LoadPage from '@/app/[locale]/load/load';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);


export default function Wrapper({ children }: { children: ReactNode }) {
    dayjs.locale(useLocale());
    // const [isInitBootstrap, setIsInitBootstrap] = useState(false);
    const [bootstrap, setBootstrap] = useState<typeof Bootstrap>();
    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        }),
    );
  
    function onReadyBootstrap() {
      setBootstrap(window.bootstrap);
      // setIsInitBootstrap(true);
    }
  
    return (
      <>
        <RecoilRoot>
          <Suspense fallback={<LoadPage />}>
            <QueryClientProvider client={queryClient}>
              <AppContext.Provider value={{ bootstrap }}>
                <ToastWrapper>
                  <ModalWrapper>
                    {children}
                  </ModalWrapper>
                </ToastWrapper>
              </AppContext.Provider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </Suspense>
        </RecoilRoot>
        <Script onReady={onReadyBootstrap} src="/lib/bootstrap.bundle.min.js" />
        {/* {isInitBootstrap && <Script src="/lib/popover.min.js" />} */}
      </>
    );
}
