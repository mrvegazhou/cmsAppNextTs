import ErrorPage from '@/app/[locale]/error/error';
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
  return getMetadata({ title: t('OtherPage.errorEncountered') });
}

export default function Page() {
  return <ErrorPage />;
}