import DeniedPage from '@/app/[locale]/403/denied';
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
  return getMetadata({ title: t('OtherPage.permissionRequired') });
}

export default function Page() {
  return <DeniedPage />;
}
