'use client';

import type {
  IGenerateCaptchaByPhoneBody,
  IPath,
  IRegisterByPhoneBody,
} from '@/interfaces';
import type { TBody, TMetadata } from '@/types';
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type JSEncrypt from 'jsencrypt';
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { isPhone } from '@/lib/tool';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'use-intl';

export default function PhoneRegister({
  data,
  metadata,
}: {
  data: IPath;
  metadata: TMetadata;
}) {
  const t = useTranslations('RegisterPage');
  const [form, setForm] = useState({
    phone: '',
    captcha: '',
    alias: '',
    isAgreeAgreement: false,
  });
  const [phoneCaptchaConfig, setPhoneCaptchaConfig] = useState({
    ...data.phoneConfig,
    isClick: false,
    countdown: 0,
    countdownId: undefined,
  });
  const [disableRegister, setDisableRegister] = useState(false);
  const captchaInputRef = useRef<HTMLInputElement>(null);
  const jsEncryptRef = useRef<JSEncrypt>();
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const urlSearchParams = useSearchParams();
  const { show } = useToast();

  useEffect(() => {
    const countdownId = phoneCaptchaConfig.countdownId;
    return () => {
      if (countdownId) {
        clearInterval(countdownId);
      }
    };
  }, [phoneCaptchaConfig.countdownId]);

  

  function onChangeForm(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'agreement') {
      setForm({ ...form, isAgreeAgreement: !form.isAgreeAgreement });
    } else {
      setForm({ ...form, [name]: value.trim() });
    }
  }

  async function onSubmit(
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLInputElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const { phone, captcha, isAgreeAgreement } = form;
      const phoneConfig = data.phoneConfig;
      if (!isAgreeAgreement) {
        agreementInputRef.current?.focus();
        show({
          type: 'DANGER',
          message: t('agreeBeforeRegister'),
        });
        return;
      } else if (!phone) {
        show({
          type: 'DANGER',
          message: t('invalidPhoneNumber'),
        });
        return;
      } else if (phoneConfig && phoneConfig.enable && !captcha) {
        show({
          type: 'DANGER',
          message: t('invalidVerificationCode'),
        });
        return;
      }

      if (phone.length !== 11 || !isPhone(phone)) {
        show({
          type: 'DANGER',
          message: t('invalidFormat'),
        });
        return;
      }

      const body = await assemblyData();
      if (!Object.keys(body).length) {
        show({
          type: 'DANGER',
          message: t('registerFailed'),
        });
        return;
      }

      setDisableRegister(true);

      show({
        message: t('refreshComplete'),
        type: 'SUCCESS',
      });

      show({
        message: t('autoLogin'),
        type: 'SUCCESS',
      });

      setTimeout(() => {
        show({
          message: t('redirect'),
          type: 'PRIMARY',
        });
      }, 1000);

      setTimeout(() => {
        const responseType =
          urlSearchParams?.get('response_type') ||
          urlSearchParams?.get('responseType');
        const clientId =
          urlSearchParams?.get('client_id') || urlSearchParams?.get('clientId');
        const redirectUri =
          urlSearchParams?.get('redirect_uri') ||
          urlSearchParams?.get('redirectUri');
        const scope =
          urlSearchParams?.get('response_type') ||
          urlSearchParams?.get('responseType');
        const state = urlSearchParams?.get('state');
        const params = {
          responseType,
          clientId,
          redirectUri,
          scope,
        } as any;

        if (state) {
          params.state = state;
        }

        if (responseType && clientId && redirectUri && scope) {
          location.href = `/oauth/auth?${new URLSearchParams(params)}`;
        } else {
          location.href = '/';
        }
      }, 1500);
    } catch (e) {

      show({
        type: 'DANGER',
        message: e,
      });
    }
  }

  async function onKeyDownCaptcha(e: KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Enter' && e.code === 'Enter') {
      const phoneConfig = data.phoneConfig;
      if (phoneConfig && phoneConfig.enable && !form.captcha) {
        await onClickRefreshCaptcha();
      } else {
        await onSubmit(e);
      }
    }
  }

  async function assemblyData() {
    const { phone, alias, captcha } = form;
    const body = {} as any;
    if (alias) {
      body.alias = alias;
    }
    if (data.phoneConfig && data.phoneConfig.enable) {
      body.code = captcha;
    }
    const ePhone = await getEncryptedPhone(phone);
    if (!ePhone) {
      show({
        type: 'DANGER',
        message: t('registerFailed'),
      });
      return;
    }
    body.phone = ePhone;
    return body;
  }

  async function onClickRefreshCaptcha() {
    try {
      const { phone } = form;
      if (!phone) {
        show({
          type: 'DANGER',
          message: t('inputToSend'),
        });
        return;
      }

      if (phone.length !== 11 || !isPhone(phone)) {
        show({
          type: 'DANGER',
          message: t('invalidFormat'),
        });
        return;
      }

      if (phoneCaptchaConfig.isClick) {
        if (phoneCaptchaConfig.countdown === 0) {
          return;
        }

        show({
          message: `${phoneCaptchaConfig.countdown} ${t('refreshAfter')}`,
          type: 'PRIMARY',
        });
        return;
      }

      if (phoneCaptchaConfig.total && phoneCaptchaConfig.total < 1) {
        show({
          type: 'DANGER',
          message: t('captchaLimitExceeded'),
        });
        return;
      }

      const ePhone = await getEncryptedPhone(phone);
      if (!ePhone) {
        show({
          type: 'DANGER',
          message: t('failedToSendVerificationCode'),
        });
        return;
      }

      if (phoneCaptchaConfig.interval) {
        let seconds = dayjs.duration(phoneCaptchaConfig.interval).asSeconds();
        let countdownId = setInterval(() => {
          if (
            seconds === 0 &&
            typeof phoneCaptchaConfig.total !== 'undefined'
          ) {
            clearInterval(countdownId);
            setPhoneCaptchaConfig({
              ...phoneCaptchaConfig,
              isClick: false,
              total: phoneCaptchaConfig.total - 1,
              countdownId: undefined,
            });
          } else {
            seconds -= 1;
            setPhoneCaptchaConfig({
              ...phoneCaptchaConfig,
              countdown: seconds,
              isClick: true,
            });
          }
        }, 1000);
      }

      captchaInputRef.current?.focus();
      show({
        type: 'PRIMARY',
        message: t('verificationCodeSent'),
      });
    } catch (e) {

      show({
        type: 'DANGER',
        message: e,
      });
    }
  }

  async function getEncryptedPhone(phone: string) {
    try {
      const publicKey = "sss"
      const jsEncrypt = await getJsEncrypt();
      jsEncrypt.setPublicKey(publicKey);
      return jsEncrypt.encrypt(phone);
    } catch (e) {
      show({
        type: 'DANGER',
        message: t('encryptionFailed'),
      });
    }
  }

  async function getJsEncrypt(): Promise<JSEncrypt> {
    let jsEncrypt;
    if (jsEncryptRef.current) {
      jsEncrypt = jsEncryptRef.current;
    } else {
      const JSEncrypt = (await import('jsencrypt')).JSEncrypt;
      jsEncrypt = new JSEncrypt();
      jsEncryptRef.current = jsEncrypt;
    }
    return jsEncrypt;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="my-3">
        <label className="form-label">{t('aliasOptional')}</label>
        <input
          value={form.alias}
          onChange={onChangeForm}
          name="alias"
          type="text"
          className="form-control"
          placeholder={t('enterAlias')}
          aria-describedby={t('enterAlias')}
        />
      </div>

      <div className="my-3">
        <label className="form-label">
          <span className="text-danger fw-bold">*</span>
          {t('phoneNumber')}
        </label>
        <input
          required
          minLength={11}
          maxLength={11}
          pattern="\d{11}"
          value={form.phone}
          onChange={onChangeForm}
          name="phone"
          type="tel"
          className="form-control"
          placeholder={t('enterPhoneNumber')}
          aria-describedby={t('enterPhoneNumber')}
        />
      </div>

      {data.phoneConfig && data.phoneConfig.enable && (
        <div className="my-3">
          <label htmlFor="phoneCaptcha" className="form-label">
            <span className="text-danger fw-bold">*</span>
            {t('captcha')}
          </label>
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 me-3">
              <input
                onKeyDown={onKeyDownCaptcha}
                required
                value={form.captcha}
                onChange={onChangeForm}
                name="captcha"
                type="text"
                placeholder={t('enterCaptcha')}
                className="form-control"
              />
            </div>
            <div className="flex-shrink-0">
              
            </div>
          </div>
        </div>
      )}

      <button

        type="submit"
        className="btn btn-outline-primary mt-4 mb-3 w-100"
      >

        {disableRegister ? (
          <span>{t('refreshComplete')}</span>
        ) : (
          <span>{t('quickRegistration')}</span>
        )}
      </button>

      <div className="form-check my-3">
        <input
          ref={agreementInputRef}
          name="agreement"
          value="agreement"
          onChange={onChangeForm}
          type="checkbox"
          className="form-check-input cursor-pointer"
        />
        <label className="form-check-label user-select-none">
          <span>{t('readAndAgree')}</span>
          <Link href="/terms">{t('serviceAgreement')}</Link>
          <span>{t('and')}</span>
          <Link href="/privacy-policy">{t('privacyPolicy')}</Link>
        </label>
      </div>
    </form>
  );
}
