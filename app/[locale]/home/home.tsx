'use client';

import type { TMetadata } from '@/types';
import type {
  IPagination,
//   IPost,
  IQueryParams,

//   ISectionGroup,
//   ITag,
} from '@/interfaces';
// import useUser from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
// import {
//   clientQueryAllPost,
//   clientQueryAllSection,
//   clientQuerySectionDetailsById,
//   queryPostRandom,
// } from '@/services/api';
// import {
//   getSectionQueryParams,
//   getTagQueryParams,
//   toRelativeTime,
// } from '@/lib/tool';
// import LoadPage from '@/app/[locale]/load/load';
// import ErrorPage from '@/app/[locale]/error/error';
import useToast from '@/hooks/useToast';
import { NavbarPage } from '@/app/[locale]/navbar';
// import FooterPage from '@/app/[locale]/footer';
import { useSearchParams } from 'next/navigation';
// import PostHome from '@/app/[locale]/home/post';
// import { HomePageContext } from '@/contexts/home';
import type { ReadonlyURLSearchParams } from 'next/dist/client/components/navigation';
// import LeftHome from '@/app/[locale]/home/left';
// import RightHome from '@/app/[locale]/home/right';
// import Nodata from '@/app/[locale]/common/nodata/nodata';
import { useTranslations } from 'use-intl';


export default function HomePage({ metadata }: { metadata: TMetadata }) {
  return (
    <>
      <NavbarPage metadata={metadata} />
      <div>home</div>
    </>
  );
}