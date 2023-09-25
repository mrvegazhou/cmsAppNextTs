import LoadPage from '@/app/[locale]/load/load';
import { Metadata as MetadataNext } from 'next';
import { getMetadata } from '@/lib/tool';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';

export async function generateMetadata({
  params: { locale },
}: {
  params: {
    locale: string;
  };
}): Promise<MetadataNext> {
  const t = createTranslator(await getMessages(locale));
  return getMetadata({ title: t('OtherPage.loading') });
}

export default function Page({
  params = {},
  searchParams = {},
}: {
  params: {};
  searchParams: {};
}) {
  return <LoadPage />;
}
