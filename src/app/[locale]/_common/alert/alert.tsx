'use client';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

export default function Alert({
  type = 'info',
  message,
}: {
  type?: 'info' | 'error' | 'warning' | 'success';
  message: any;
}) {
  const t = useTranslations('OtherPage');

  function getAlert(message: any) {
    const a = t('sorryEncounteredError');
    if (typeof message === 'object' && 'message' in message) {
      return message.message || a;
    } else if (typeof message === 'string' && message) {
      return message || a;
    }
    return message + '';
  }

  return (
    <div className="container-fluid">
      <div
        className={classNames('alert d-flex align-items-center', {
          'alert-primary': type === 'info',
          'alert-success': type === 'success',
          'alert-danger': type === 'error',
          'alert-warning': type === 'warning',
        })}
        role="alert"
      >
        {type === 'info' && <i className="bi bi-info-circle-fill me-2"></i>}
        {type === 'success' && <i className="bi bi-check-circle-fill me-2"></i>}
        {type === 'error' && (
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
        )}
        <div>{getAlert(message)}</div>
      </div>
    </div>
  );
}
