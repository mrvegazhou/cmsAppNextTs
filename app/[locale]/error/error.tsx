'use client';

import { ColorModeItem } from '@/app/[locale]/navbar';
import { useTranslations } from 'use-intl';

export default function ErrorPage({ error = '未知错误' }: { error?: any }) {
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
              <h1 className="text-primary display-5 text-danger">
                ERROR - UNKNOWN ERROR
              </h1>
              <p className="lead">{t('sorryEncounteredError')}</p>
              <p>
                <span>详情：</span>
                <span className="text-muted">
                  {typeof error === 'object' && error.message
                    ? error.message || error + ''
                    : error + ''}
                </span>
              </p>

              <div className="hstack flex-wrap justify-content-center my-5 gap-4">
                <a
                  href="/"
                  className="fw-bold text-danger text-decoration-none cursor-pointer"
                >
                  <div className="border border-2 border-danger rounded-5 px-4 py-2 d-inline-block text-danger">
                    {t('backToHome')}
                  </div>
                </a>

                <a
                  onClick={onClickReturn}
                  className="fw-bold text-danger text-decoration-none cursor-pointer"
                >
                  <div className="border border-2 border-danger rounded-5 px-4 py-2 d-inline-block">
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
