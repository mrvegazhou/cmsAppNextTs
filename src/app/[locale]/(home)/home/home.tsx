'use client';

import type { TMetadata } from '@/types';
import type {
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
import Header from '../../_layouts/siteHeader';
// import FooterPage from '@/app/[locale]/footer';
import { useSearchParams } from 'next/navigation';
// import PostHome from '@/app/[locale]/home/post';
// import { HomePageContext } from '@/contexts/home';
import type { ReadonlyURLSearchParams } from 'next/dist/client/components/navigation';
// import LeftHome from '@/app/[locale]/home/left';
// import RightHome from '@/app/[locale]/home/right';
// import Nodata from '@/app/[locale]/_common/nodata/nodata';
import { useTranslations } from 'next-intl';


export default function HomePage({ metadata }: { metadata: TMetadata }) {
  
  return (
    <>
      <Header metadata={metadata} />
    </>
  );
}