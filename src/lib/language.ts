import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from '@/lib/constant/locales';
import { staticRouter } from '@/lib/constant/router';

export function generateStaticParams() {
  return ['en', 'zh'].map((locale) => ({ locale }));
}

export const localePrefix = undefined;
export const pathnames = {} as any;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames,
    localePrefix,
  });

export type AppPathnames = keyof typeof staticRouter;

