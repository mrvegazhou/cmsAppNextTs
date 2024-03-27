'use client';

import {
    type MouseEvent,
    useState,
    useRef,
} from 'react';
import type { TMetadata } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../_layouts/siteHeader';
import Footer from '../../_layouts/siteFooter';
import useRegister from '@/hooks/useRegister';
import Captcha from '@/components/captcha/Captcha';
import type { IPageInfo } from '@/interfaces';

export default function RegisterPage({ pageInfo, metadata }: { pageInfo: IPageInfo | null; metadata: TMetadata }) {
    
    return (
      <>
        <Header metadata={metadata} />
        <Register metadata={metadata} pageInfo={pageInfo} />
        <Footer metadata={metadata} />
      </>
    );
}

const Register = ({ pageInfo, metadata }: { pageInfo: IPageInfo | null; metadata: TMetadata }) => {

    const captchaRef = useRef();

    function showSlideCaptcha() {
        setShowCaptcha(true);
        // @ts-ignore
        captchaRef.current?.verify();
    }

    const {
        t,
        strength,
        regEmail,
        regCode,
        regPassword,
        regConfirmPassword,
        registerByEmailMutation,
        showCaptcha, 
        setShowCaptcha,
        handleRegisterChange,
        onSubmitSendCode4Reg,
        onSubmitReg
    } = useRegister();

    const router = useRouter();
    const params = useParams()
    function jump2Login() {
        const locale = params.locale;
        let path = '/login';
        if (locale!=undefined && locale!="") {
          path = `/${locale}/login`;
        }
        router.push(path);
    }

    return (
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
                <div className="d-flex h-100">
                <div className="vr text-opacity-75"></div>
                </div>
            </div>
            <div className="col ps-0 pe-3">
                <div className='py-3 hstack gap-2 justify-content-start text-muted'>
                <div className="cursor-default"><small>{t('haveAccountYet')}</small></div>
                <div>
                    <a className="btn btn-outline-secondary" href="#!" onClick={jump2Login} rel="noreferrer"><small>{t('beginLogin')}</small></a>
                </div>
                </div>
                <div className="card-body pe-4 vstack gap-4 my-2">
                <form>
                    <div className="my-3">
                        <label className="form-label"><span className="text-danger fw-bold">*</span>{t("email")}</label>
                        <div className="hstack">
                            <div className="col-sm-8">
                                <input className="form-control" placeholder={t("emailPlaceHolder")} type="text" value={regEmail} name="regEmail"  onChange={handleRegisterChange}/>
                            </div>
                            <div className="ms-3 col-sm-3">
                                <button name="sendVerify" type="button" className="btn btn-outline-primary" onClick={onSubmitSendCode4Reg}><small>{t('sendEmailCode')}</small></button>
                            </div>
                        </div>
                    </div>
                    <div className="my-3">
                        <label className="form-label"><span className="text-danger fw-bold">*</span>{t("captcha")}</label>
                        <div className="col-sm-10">
                            <input className="form-control" type="text" value={regCode} name="regCode"  onChange={handleRegisterChange}/>
                        </div>
                    </div>
                    <div className="my-3">
                        <label className="form-label"><span className="text-danger fw-bold">*</span>{t("password")}</label>
                        <div className="col-sm-10">
                            <input placeholder={t("pwdPlaceHolder")} className="form-control" type="password" value={regPassword} name="regPassword"  onChange={handleRegisterChange}/>
                        </div>
                    </div>
                    <div className="my-3">
                        <label className="form-label"><span className="text-danger fw-bold">*</span>{t('confirmPassword')}</label>
                        <div className="col-sm-10">
                            <input placeholder={t("pwdPlaceHolder")} className="form-control" type="password" value={regConfirmPassword} name="regConfirmPassword"  onChange={handleRegisterChange}/>
                        </div>
                    </div>
                    { showCaptcha && (
                        <Captcha
                            onSuccess={(data) => onSubmitReg()}
                            type='auto'
                            email={regEmail}
                            mode='register'
                            ref={captchaRef}
                        ></Captcha>
                    )}
                    <div className="text-center col-sm-10">
                        <button type="button" disabled={registerByEmailMutation.isPending} className="btn btn-outline-primary mt-4 mb-3 w-50" onClick={showSlideCaptcha}><span>{t('regInNow')}</span></button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};