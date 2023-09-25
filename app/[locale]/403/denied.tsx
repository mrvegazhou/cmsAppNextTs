'use client';

import { ColorModeItem } from '@/app/[locale]/navbar';
import { useTranslations } from 'use-intl';

export default function DeniedPage() {
  const t = useTranslations('OtherPage');

  function onClickReturn() {
    history.back();
  }

  return (
    <>
      <div className="col px-0 vh-100">
        <div className="card border-0 h-100">
          <div className="card-body align-items-center card-body d-flex justify-content-center text-center">
            <div>
              <h1 className="text-danger display-5">403 - ACCESS DENIED</h1>
              <p className="lead">{t('sorryAuthPermissionRequired')}</p>

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
                  onClick={onClickReturn}
                  className="fw-bold text-primary text-decoration-none cursor-pointer"
                >
                  <div className="border border-2 border-primary rounded-5 px-4 py-2 d-inline-block">
                    {t('backToPrevious')}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ColorModeItem hidden={true} />
    </>
  );
}
