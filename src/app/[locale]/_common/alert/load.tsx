'use client';

import { useTranslations } from 'next-intl';

export default function AlertLoad() {
  const t = useTranslations('OtherPage');

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between gap-2">
        <div>{t('loading')}...</div>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
}
