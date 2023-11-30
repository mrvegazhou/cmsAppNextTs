import '@/styles/global.scss';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getMetadata } from '@/lib/tool';
import classNames from 'classnames';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';
import Wrapper from '@/app/[locale]/wrapper';

const inter = Inter({ subsets: ['latin'] })

export const metadata = getMetadata();

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode,
  params: { locale: string };
}) {

  const { locale: _locale, messages } = await getMessages(locale);
  return (
    <html lang={_locale} data-bs-theme="auto">
      <body
        className={classNames(
          inter.className,
          'row',
          'mx-0',
        )}
      >
        <NextIntlClientProvider locale={_locale} messages={messages}>
          <Wrapper>{children}</Wrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
