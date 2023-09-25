import UnauthorizedPage from '@/app/[locale]/401/unauthorized';
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
  return getMetadata({ title: t('OtherPage.authRequired') });
}

export default function Page() {
  return <UnauthorizedPage />;
}
