'use client';

import { useEffect, useState } from 'react';
import DeniedPage from '@/app/[locale]/403/denied';
import NotFoundPage from '@/app/[locale]/notfound/notfound';
import UnauthorizedPage from '@/app/[locale]/401/unauthorized';
import { ColorModeItem } from '@/app/[locale]/navbar';
import { useTranslations } from 'use-intl';
import { useMutation } from '@tanstack/react-query';

const DEFAULT_INFO = {
    message: 'Unknown error',
    status: 500,
    code: 0,
};

const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const UNAUTHORIZED_CODE0 = 4010;
const UNAUTHORIZED_CODE1 = 4011;


export default function ResetPage({ error }: { error?: any }) {
  
    const [info, setInfo] = useState(DEFAULT_INFO);
    const [loadingErrorDetails, setLoadingErrorDetails] = useState(true);
  
    // const clientClearTokenMutation = useMutation(clientClearToken);
    // const clientRefreshTokenMutation = useMutation(clientRefreshToken);
    
    useEffect(() => {
      if (!error) return;
  
      let newInfo = { ...DEFAULT_INFO };
     
      if (typeof error === 'object') {
        
        if ('message' in error) {
          const { message, status, code } = error;
          newInfo = { message, status, code };
  
        //   if (status === UNAUTHORIZED_STATUS && code === UNAUTHORIZED_CODE1) {
        //     clientClearTokenMutation.mutateAsync({});
        //   } else if (
        //     status === UNAUTHORIZED_STATUS &&
        //     code === UNAUTHORIZED_CODE0
        //   ) {
        //     clientRefreshTokenMutation.mutateAsync({});
        //   }
            status === UNAUTHORIZED_STATUS &&
            code === UNAUTHORIZED_CODE0
        } else if ('cause' in error) {
          const { cause, status, code } = error;
          newInfo.message = `${cause.address} ${cause.port} ${cause.code} ${cause.errno}`;
          newInfo.status = status;
          newInfo.code = code;
        } else {
          newInfo.message = error + '';
        }
      } else if (typeof error === 'string') {
        newInfo.message = error;
      } else {
        newInfo.message = error + '';
      }
  
      setInfo(newInfo);
      setLoadingErrorDetails(false);
    }, [error]);
  
    const isErrorStatus = [
      UNAUTHORIZED_STATUS,
      FORBIDDEN_STATUS,
      NOT_FOUND_STATUS,
    ].includes(info.status);

    return (
      <>
        {isErrorStatus && info.status === UNAUTHORIZED_STATUS && (
          <UnauthorizedPage />
        )}
        {isErrorStatus && info.status === FORBIDDEN_STATUS && <DeniedPage />}
        {isErrorStatus && info.status === NOT_FOUND_STATUS && <NotFoundPage />}
        {!isErrorStatus && (
          <DefaultPage loadingErrorDetails={loadingErrorDetails} info={info} />
        )}
      </>
    );
}

const DefaultPage = ({
    loadingErrorDetails,
    info,
  }: {
    loadingErrorDetails: boolean;
    info: {
      message: string;
      status: number;
      code: number;
    };
  }) => {
    const t = useTranslations('OtherPage');
  
    function onClickReset() {
      location.reload();
    }
  
    return (
      <>
        <div className="col px-0 vh-100">
          <div className="card border-0 h-100">
            <div className="card-body align-items-center card-body d-flex justify-content-center text-center">
              <div>
                <h1 className="text-primary display-5">ERROR - UNKNOWN ERROR</h1>
                <p className="lead">{t('sorryEncounteredError')}</p>
  
                {loadingErrorDetails ? (
                  <div className="hstack gap-3 justify-content-center align-items-center">
                    <div>{t('loadingErrorDetails')}...</div>
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      aria-hidden="true"
                    ></div>
                  </div>
                ) : (
                  <p className="text-danger">
                    {t('details')}：{info.message}
                  </p>
                )}
  
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
                    onClick={onClickReset}
                    className="fw-bold text-primary text-decoration-none cursor-pointer"
                  >
                    <div className="border border-2 border-primary rounded-5 px-4 py-2 d-inline-block">
                      {t('refreshPage')}
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
};
  

