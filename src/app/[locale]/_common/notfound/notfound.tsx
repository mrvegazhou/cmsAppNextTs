'use client';

import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('OtherPage');

  return (
    <div className="container-fluid bg-white vh-100 p-2">
      <div className="position-absolute top-50 start-50 translate-middle">
        <div className="text-center vw-100">
          <h1 className="text-primary display-5">404 - NOT FOUND</h1>
          <p className="lead">{t('sorryNotFound')}</p>

          <div className="hstack flex-wrap justify-content-center my-5 gap-4">
            <a
              href="/"
              className="fw-bold text-primary text-decoration-none cursor-pointer"
            >
              <div className="border border-2 border-primary rounded-5 px-4 py-2 d-inline-block">
                {t('backToHome')}
              </div>
            </a>

            <a
              href="/sections"
              className="fw-bold text-primary text-decoration-none cursor-pointer"
            >
              <div className="border border-2 border-primary rounded-5 px-4 py-2 d-inline-block">
                {t('backToContent')}
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
