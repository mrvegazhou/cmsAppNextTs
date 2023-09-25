'use client';

import type { TMetadata } from '@/types';
import Captcha from '@/components/captcha/Captcha';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { NavbarPage } from '@/app/[locale]/navbar';

import FooterPage from '@/app/[locale]/footer';
import useLogin from '@/hooks/useLogin';
import LoginForget from '@/app/[locale]/login/loginForget';
import type { IPageInfo } from '@/interfaces';

export default function LoginPage({ pageInfo, metadata }: { pageInfo: IPageInfo | null; metadata: TMetadata }) {
  
  return (
    <>
      <NavbarPage metadata={metadata} />
      <Login metadata={metadata} pageInfo={pageInfo} />
      <FooterPage metadata={metadata} />
    </>
  );
}


const Login = ({ pageInfo, metadata }: { pageInfo: IPageInfo | null; metadata: TMetadata }) => {

  const router = useRouter();
  const params = useParams();

  const [showLoginForm, setShowLoginForm] = useState(true);

  const {
    t,
    disableLogin,
    email, setEmail,
    password, setPassword, 
    strength,
    showCaptcha,
    loginByEmailMutation,
    captchaRef,
    emailInputRef,
    passwordInputRef,
    jToken,
    handleChange,
    onSubmit
  } = useLogin();

  function jump2Reg() {
    const locale = params.locale;
    let path = '/register';
    if (locale!=undefined && locale!="") {
      path = `/${locale}/register`;
    }
    router.push(path);
  }

  return (
    <>
        <div className="row pt-5 mt-3">
          <div className="col pe-0">
            <div className="card rounded-start-4 border-0 h-100">
              <div className="card-body ps-4 ms-4">
                <div className="fs-4 text-left fw-bold">{pageInfo?.title}</div>
                <div className="my-3 vstack gap-4">{pageInfo?.content}</div>
              </div>
            </div>
          </div>
          <div className="col-auto px-5">
            <div className="card border-0 h-100">
              <div className="card-body d-flex align-items-center position-relative py-0">
                <div className="d-flex position-absolute start-0 end-0 top-0 h-100 py-5 justify-content-center">
                  <div className="vr text-secondary text-opacity-75"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col ps-0 pe-3">
            <div className='py-3 hstack gap-2 justify-content-start text-muted'>
              <div className='hstack me-3'>
                <div className="cursor-default"><small>{t("noAccountYet")}</small></div>
                <div>
                  <a className="btn btn-outline-secondary" href="#!" onClick={jump2Reg} rel="noreferrer">
                    <small>{t("beginReg")}</small>
                  </a>
                </div>
              </div>
              { showLoginForm && (
              <div className='hstack'>
                <div className="cursor-default"><small>{t("forgetAccount")}</small></div>
                <div>
                  <a className="text-muted" href="#!" onClick={()=>{setShowLoginForm(false)}} rel="noreferrer"><small>{t("loginForgot")}</small></a>
                </div>
              </div>
              )}
              { !showLoginForm && (
              <div className='hstack'>
                <div className="cursor-default"><small>{t("haveAccountYet")}</small></div>
                <div>
                  <a className="text-muted" href="#!" onClick={()=>{setShowLoginForm(true)}} rel="noreferrer"><small>{t("login")}</small></a>
                </div>
              </div>
              )}
            </div>
            <div className="card-body pe-4 vstack gap-4 my-2">
            { showLoginForm && (
              <form>
                <div className="my-3">
                  <label className="form-label"><span className="text-danger fw-bold">*</span>{t("email")}</label>
                  <div className="col-sm-10">
                    <input className="form-control" placeholder={t("emailPlaceHolder")} type="text" ref={emailInputRef} value={email}  name="email" onChange={handleChange} />
                  </div>
                </div>
                <div className="my-3">
                  <label className="form-label"><span className="text-danger fw-bold">*</span>{t("password")}</label>
                  <div className="col-sm-10">
                    <input placeholder={t("pwdPlaceHolder")} className="form-control" type="password" ref={passwordInputRef}  value={password} name="password" onChange={handleChange} />
                  </div>
                </div>
                { showCaptcha && (
                    <Captcha
                        onSuccess={(data) => {}}
                        type='auto'
                        mode='login'
                        email={email}
                        popup="force"
                        ref={captchaRef}
                    ></Captcha>
                )}
                <div className="col-sm-10 text-center">
                  <button onClick={onSubmit} type="button" disabled={loginByEmailMutation.isLoading || disableLogin} className="btn btn-outline-primary mt-4 mb-3 w-50"><span>{t("logInNow")}</span></button>
                </div>
              </form>
            )}
            { !showLoginForm && (
              <form>
                <LoginForget email={email} />
              </form>
            )}
            </div>
          </div>
        </div>
    </>
  );
};