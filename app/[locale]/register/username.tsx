'use client';

import type {
  IGenerateCaptchaByUsername,
  IGenerateCaptchaByUsernameBody,
  IGenerateImageId,
  IPath,
  IRegisterByUsernameBody,
} from '@/interfaces';
import type { TBody, TMetadata } from '@/types';
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type JSEncrypt from 'jsencrypt';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'use-intl';

export default function UsernameRegister({
  data,
  metadata,
}: {
  data: IPath;
  metadata: TMetadata;
}) {
  const t = useTranslations('RegisterPage');
  const env = metadata.env;
  const [form, setForm] = useState({
    username: '',
    password: '',
    captcha: '',
    isAgreeAgreement: false,
  });
  const [imageCaptchaId, setImageCaptchaId] = useState('');
  const [imageLoadFailure, setImageLoadFailure] = useState(false);
  const [usernameCaptchaConfig, setUsernameCaptchaConfig] = useState({
    ...data.imageConfig,
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
    const countdownId = usernameCaptchaConfig.countdownId;
    return () => {
      if (countdownId) {
        clearInterval(countdownId);
      }
    };
  }, [usernameCaptchaConfig.countdownId]);


  function onChangeForm(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'agreement') {
      setForm({ ...form, isAgreeAgreement: !form.isAgreeAgreement });
    } else {
      setForm({ ...form, [name]: value.trim() });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const { username, password, captcha, isAgreeAgreement } = form;
      const imageConfig = data.imageConfig;

      if (!isAgreeAgreement) {
        agreementInputRef.current?.focus();
        show({
          type: 'DANGER',
          message: t('agreeBeforeRegister'),
        });
        return;
      } else if (!username) {
        show({
          type: 'DANGER',
          message: t('invalidUsername'),
        });
        return;
      } else if (!password) {
        show({
          type: 'DANGER',
          message: t('invalidPassword'),
        });
        return;
      } else if (imageConfig && imageConfig.enable && !captcha) {
        show({
          type: 'DANGER',
          message: t('invalidVerificationCode'),
        });
        return;
      } else if (imageConfig && imageConfig.enable && !imageCaptchaId) {
        show({
          type: 'DANGER',
          message: t('refreshCaptcha'),
        });
        return;
      }

      if (username.length < 3 || username.length > 16) {
        show({
          type: 'DANGER',
          message: t('accountLength'),
        });
        return;
      }

      if (password.length < 6 || password.length > 19) {
        show({
          type: 'DANGER',
          message: t('passwordLength'),
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

  async function assemblyData() {
    const { username, password, captcha } = form;
    const body = {
      alias: username,
      username,
    } as any;
    if (data.imageConfig && data.imageConfig.enable && imageCaptchaId) {
      body.cid = imageCaptchaId.split('?')[0] || username;
      body.code = captcha;
    }
    const ePassword = await getEncryptedPassword(password);
    if (!ePassword) {
      show({
        type: 'DANGER',
        message: t('registerFailed'),
      });
      return;
    }
    body.password = ePassword;
    return body;
  }

  function onErrorImage() {
    setImageLoadFailure(true);
    show({
      type: 'INFO',
      message: t('refreshCaptchaPrompt'),
    });
  }

  async function onClickRefreshCaptcha() {
    try {
      const { username } = form;
      if (!username) {
        show({
          type: 'DANGER',
          message: t('enterAccountBeforeRefresh'),
        });
        return;
      }

      if (usernameCaptchaConfig.isClick) {
        if (usernameCaptchaConfig.countdown === 0) {
          return;
        }

        show({
          message: `${usernameCaptchaConfig.countdown} ${t('refreshAfter')}`,
          type: 'PRIMARY',
        });
        return;
      }

      if (usernameCaptchaConfig.total && usernameCaptchaConfig.total < 1) {
        show({
          type: 'DANGER',
          message: t('captchaLimitExceeded'),
        });
        return;
      }

      if (usernameCaptchaConfig.interval) {
        let seconds = dayjs
          .duration(usernameCaptchaConfig.interval)
          .asSeconds();
        let countdownId = setInterval(() => {
          if (
            seconds === 0 &&
            typeof usernameCaptchaConfig.total !== 'undefined'
          ) {
            clearInterval(countdownId);
            setUsernameCaptchaConfig({
              ...usernameCaptchaConfig,
              isClick: false,
              total: usernameCaptchaConfig.total - 1,
              countdownId: undefined,
            });
          } else {
            seconds -= 1;
            setUsernameCaptchaConfig({
              ...usernameCaptchaConfig,
              countdown: seconds,
              isClick: true,
            });
          }
        }, 1000);
      }

      captchaInputRef.current?.focus();
      show({
        type: 'PRIMARY',
        message: t('refreshComplete'),
      });
    } catch (e) {

      show({
        type: 'DANGER',
        message: e,
      });
    }
  }

  async function getEncryptedPassword(password: string) {
    // try {
    //   const publicKey = await queryPasswordPublicKeyMutation.mutateAsync();
    //   const jsEncrypt = await getJsEncrypt();
    //   jsEncrypt.setPublicKey(publicKey);
    //   return jsEncrypt.encrypt(password);
    // } catch (e) {
    //   queryPasswordPublicKeyMutation.reset();
    //   show({
    //     type: 'DANGER',
    //     message: t('encryptionFailed'),
    //   });
    // }
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
        <label className="form-label">
          <span className="text-danger fw-bold">*</span>
          {t('account')}
        </label>
        <input
          required
          value={form.username}
          onChange={onChangeForm}
          name="username"
          type="text"
          className="form-control"
          placeholder={t('enterAccount')}
          aria-describedby={t('enterAccount')}
        />
      </div>

      <div className="my-3">
        <label className="form-label">
          <span className="text-danger fw-bold">*</span>
          {t('password')}
        </label>
        <input
          required
          value={form.password}
          onChange={onChangeForm}
          name="password"
          type="password"
          placeholder={t('enterPassword')}
          className="form-control"
          autoComplete="password"
        />
      </div>

      {data.imageConfig && data.imageConfig.enable && (
        <div className="my-3">
          <div className="d-flex align-items-center justify-content-between">
            
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 me-2">
              <input
                ref={captchaInputRef}
                required
                value={form.captcha}
                onChange={onChangeForm}
                name="captcha"
                type="text"
                placeholder={t('enterCaptcha')}
                className="form-control"
              />
            </div>
           
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-outline-primary mt-4 mb-3 w-100"
      >

          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>

        {disableRegister ? (
          <span>{t('refreshComplete')}</span>
        ) : (
          <span>{t('quickRegistration')}</span>
        )}
      </button>

      <div className="form-check my-3">
        <input
          id="yw-register-agreement"
          ref={agreementInputRef}
          name="agreement"
          value="agreement"
          onChange={onChangeForm}
          type="checkbox"
          className="form-check-input cursor-pointer"
        />
        <label
          htmlFor="yw-register-agreement"
          className="form-check-label user-select-none"
        >
          <span>{t('readAndAgree')}</span>
          <Link href="/terms">{t('serviceAgreement')}</Link>
          <span>{t('and')}</span>
          <Link href="/privacy-policy">{t('privacyPolicy')}</Link>
        </label>
      </div>
    </form>
  );
}
