'use client';

import {
    type MouseEvent,
} from 'react';
import Captcha from '@/components/captcha/Captcha';
import useLoginForget from '@/hooks/useLogin/forget';


export default function LoginForgetNav({ email, goBack }: { email: string, goBack: (e: MouseEvent<HTMLButtonElement>) => void }) {
    const {
        t,
        showEmailInput,
        showVerifyCode,
        showCaptcha,
        sendEmailCodeMutation,
        modeType,
        email4Forget,
        captchaRef,
        changeNewPwdByEmailCodeMutation,
        handleVerifyCodeChange,
        verifySuccess,
        onSubmitSendCode4ForgetPwd,
        onSubmitChangePwdByEmailCode
    } = useLoginForget(email);

    return <>
        <form>
            <div className="form-group row">
                <label className="col-sm-3 col-form-label">{t('email')}</label>
                <div className="col-sm-5">
                    <input name="email" disabled={!showEmailInput} className="form-control" value={email4Forget} onChange={handleVerifyCodeChange} />
                </div>
                <div className="col-sm-3">
                    <button name="sendVerify" disabled={sendEmailCodeMutation.isPending} type="button" className="btn btn-outline-primary" onClick={onSubmitSendCode4ForgetPwd}><small>{t('sendEmailCode')}</small></button>
                </div>
            </div>
            <div className="form-group row mt-4">
                <label className="col-sm-3 col-form-label">{t('captcha')}</label>
                <div className="col-sm-8">
                    <input name="verifyCode" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="form-group row mt-4">
                <label className="col-sm-3 col-form-label">{t('password')}</label>
                <div className="col-sm-8">
                    <input name="forgetPassword" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="form-group row mt-4">
                <label className="col-sm-3 col-form-label">{t('confirmPassword')}</label>
                <div className="col-sm-8">
                    <input name="forgetConfirmPassword" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="form-group form-row mt-4 text-center">
                <small className="form-text text-muted">
                    {t('sendCodeToEmailTip')}
                </small>
            </div>
            {showCaptcha && (
                <Captcha
                    onSuccess={(data) => verifySuccess()}
                    type='auto'
                    mode={modeType}
                    email={email4Forget}
                    ref={captchaRef}
                ></Captcha>
            )}
            <div className='form-row text-center mt-4'>
                <button name="back" type="button" className="btn btn-outline-secondary me-4" onClick={goBack}>{t('goBack')}</button>
                <button name="confirmVerify" disabled={changeNewPwdByEmailCodeMutation.isPending} type="button" className="btn btn-outline-primary " onClick={onSubmitChangePwdByEmailCode}>{t('modifyPassword')}</button>
            </div>    
        </form>
    </>
}
