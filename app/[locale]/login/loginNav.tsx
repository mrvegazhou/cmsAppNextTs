'use client';

import {
    type MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
    memo
} from 'react';
import { useRouter, useParams } from "next/navigation";
import RegisterNav from '@/app/[locale]/register/registerNav';
import LoginForgetNav from '@/app/[locale]/login/loginForgetNav';
import Captcha from '@/components/captcha/Captcha';
import { USER_TOKEN, TOKEN_SECRET } from '@/lib/constant';
import { REFRESH_TOKEN_BUFFER } from '@/lib/constant/app';
import { decodeJwtExpToSeconds } from '@/lib/tool';
import { refreshToken } from '@/services/api';
import type { IData } from '@/interfaces';
import useLogin from '@/hooks/useLogin';
import { aesDecryptStr } from '@/lib/tool';

const LoginNav = () => {


    const params = useParams()
    // 显示忘记密码
    const [showForgetPwd, setShowForgetPwd] = useState(false);
    // 显示注册
    const [showRegister, setShowRegister] = useState(false);
    // 显示登录框
    const [showLoginForm, setShowLoginForm] = useState(true);

    const {
        t,
        disableLogin,
        email, setEmail,
        password, setPassword, 
        strength, setStrength,
        showCaptcha,
        loginByEmailMutation,
        captchaRef,
        emailInputRef,
        passwordInputRef,
        jToken,
        handleChange,
        onSubmit
    } = useLogin(()=>{ onClickCloseModal(); });

    const router = useRouter();
    const loginModalRef = useRef<HTMLDivElement>(null);

     // 关闭modal
    function onClickCloseModal() {
        const current = loginModalRef.current;
        if (!current) {
          throw '登录弹窗不存在';
        }
        window.bootstrap.Modal.getOrCreateInstance(current).hide();
    }

    // refresh token
    const validateTokens = useCallback(
        async (reToken: string) => {
            if (reToken) {
                const res = await refreshToken({
                    data: {refreshToken: reToken}
                }) as IData<any>;
                if (res.status!=200) {
                    const locale = params.locale;
                    let path = '/login';
                    if (locale!='undefined' && locale!="") {
                        path = `/${locale}/login`;
                    }
                    router.push(path);
                }
            }
        },
        [],
    );
    

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const JWT = USER_TOKEN.get();
        const token = JWT.token;
        const retoken = JWT.refreshToken;
        if ((token!='undefined' && retoken!='undefined') && (token && retoken)) { 
            const tokenSeconds = decodeJwtExpToSeconds(token);
            if (!tokenSeconds || tokenSeconds <= 0) {
                validateTokens(retoken);
            } else {
                const currentTime = Math.floor(Date.now() / 1000);
                const timeToExpire = (tokenSeconds - currentTime - REFRESH_TOKEN_BUFFER) * 1000;
                timer = setTimeout(() => {
                    validateTokens(retoken);
                }, Math.max(0, timeToExpire));
            }
        }
        return () => {
            clearTimeout(timer);
        };
    }, [validateTokens, jToken]);

    function clearInput() {
        // @ts-ignore
        emailInputRef.current.value = '';
        // @ts-ignore
        passwordInputRef.current.value = '';
        setEmail("");
        setPassword("");
    }
  
    function resetLoginFormModal() {
        clearInput();
        setShowLoginForm(true);
        setShowRegister(false);
        setShowForgetPwd(false);
        setStrength(0);
    }

    function showForgetPwdModal() {
        setShowForgetPwd(true);
        setShowLoginForm(false);
    }
    
    function showRegisterModal() {
        setShowRegister(true);
        setShowLoginForm(false);
    }

    function goBack(e: MouseEvent<HTMLButtonElement>) {
        setShowLoginForm(true);
        setShowForgetPwd(false);
        setShowRegister(false);
    }
  
    return (
      <>
        <a
            className="nav-link"
            role="button"
            data-bs-toggle="modal"
            data-bs-target="#loginModel"
            onClick={resetLoginFormModal}
            >
            <i className='iconfont icon-denglu fs-3 text-black-50'></i>
        </a>
        <div ref={loginModalRef} className="modal fade" id="loginModel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth:"590px"}}>
            <div className="modal-content">
                <div className="d-flex flex-row justify-content-end">
                <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2"  data-dismiss="modal" aria-hidden="true">
                    <i className='iconfont icon-close fs-4'></i>
                </a>
                </div>
                <div className="modal-body">
                { showRegister && (
                    <RegisterNav goBack={goBack} />
                )}
                { showForgetPwd && (
                    <LoginForgetNav email={email} goBack={goBack} />
                )}
                { showLoginForm && (
                    <form>
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label">{t('email')}</label>
                        <div className="col-sm-8">
                        <input name="email" ref={emailInputRef} value={email} className="form-control" onChange={handleChange}/>
                        </div>
                    </div>
                    <div className="form-group row mt-4">
                        <label className="col-sm-3 col-form-label">{t('password')}</label>
                        <div className="col-sm-8">
                        <input name="password" ref={passwordInputRef}  value={password} type="password" className="form-control col-sm-10" onChange={handleChange}/>
                        {strength>0 && (
                            <div className="row" style={{margin:"10px 0 0 3px"}}>
                                {strength==1 && <div className='w-15 border border-2 border-secondary'></div>}
                                {strength==2 && (<><div className='w-15 border border-2 border-secondary'></div><div className='w-15 border border-2 border-warning mx-1'></div></>)}
                                {strength==3 && (<><div className='w-15 border border-2 border-secondary'></div><div className='w-15 border border-2 border-warning mx-1'></div><div className='w-15 border border-2 border-danger'></div></>)}
                            </div>
                        )}
                        </div>
                    </div>
                    { showCaptcha && (
                        <Captcha
                            onSuccess={(data) => onSubmit()}
                            type='auto'
                            mode='login'
                            email={email}
                            popup="force"
                            ref={captchaRef}
                        ></Captcha>
                    )}
                    <div className="form-group form-row mt-4" style={{marginLeft: "30%"}}>
                        <small className="form-text text-muted">
                        {t('loginForgot')} <a href='#' onClick={showForgetPwdModal}>{t('password')}</a>?
                        </small>
                    </div>
                    <div className="form-group form-row mt-1" style={{marginLeft: "30%"}}>
                        <small className="form-text text-muted">
                        {t('notRegistered')} <a href='#' onClick={showRegisterModal}>{t('quickRegister')}</a>
                        </small>
                    </div>
                    <div className='form-row text-center mt-4'>
                        <button disabled={disableLogin} type="button" className="btn btn-outline-primary" onClick={onSubmit}>
                            {t('login')}
                        </button>
                    </div>
                    </form>
                )}
                </div>
            </div>
            </div>
        </div>
      </>
    );
};

export default memo(LoginNav);