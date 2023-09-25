import type { ISiteConfig } from '@/interfaces';
import type { QueryKey } from '@tanstack/query-core';
import type { TError, TMetadata } from '@/types';
import { querySiteConfig } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export default function useUser(
  queryKey?: QueryKey | TMetadata,
  initialData?: ISiteConfig
) {
  const rootPath = '/user/info';
  let qKey;
  if (queryKey) {
    if ('all' in queryKey) {
      qKey = queryKey.all['siteConfig'].k;
      initialData = queryKey.all['siteConfig'].v as ISiteConfig;
    } else {
      qKey = queryKey[0] === rootPath ? queryKey : [rootPath, ...queryKey];
    }
  } else {
    qKey = [rootPath, '/'];
  }

  return useQuery<ISiteConfig, TError>(
    qKey,
    async () => {
      return (await querySiteConfig()).data as ISiteConfig;
    },
    {
      initialData,
    }
  );
}
