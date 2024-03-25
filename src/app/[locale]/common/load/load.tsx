'use client';
import { useTranslations } from 'next-intl';

export default function LoadPage() {
  const t = useTranslations('OtherPage');

  return (
    <>
      <div className="col px-0 vh-100">
        <div className="card border-0 h-100">
          <div className="card-body align-items-center card-body d-flex justify-content-center text-center">
            <div>
              <div className="hstack gap-2">
                <div className="spinner-border" role="status"></div>
                <div className="text-muted">{t('loading')}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
