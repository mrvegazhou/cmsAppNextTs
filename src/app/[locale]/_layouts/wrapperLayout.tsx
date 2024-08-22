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
import ToastWrapper from '../_common/toast/wrapper';
import { Provider as JotaiProvider } from 'jotai';
import LoadPage from '../_common/load/load';


dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);


export default function Wrapper({ 
    children,
    locale 
  }: {
    children: ReactNode,
    locale: string
  }) {
    dayjs.locale(locale=='zh' ? 'zh-cn' : locale);
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
    }
  
    return (
      <>
        <JotaiProvider>
          <Suspense fallback={<LoadPage />}>
            <QueryClientProvider client={queryClient}>
              <AppContext.Provider value={{ bootstrap }}>
                <ToastWrapper>
                    {children}
                </ToastWrapper>
              </AppContext.Provider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </Suspense>
        </JotaiProvider>
        <Script onReady={onReadyBootstrap} src="/lib/bootstrap.bundle.min.js" />
      </>
    );
}
