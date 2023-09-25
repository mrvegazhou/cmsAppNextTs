'use client';

import {
    type MouseEvent,
    useState,
    useRef,
} from 'react';
import Captcha from '@/components/captcha/Captcha';
import useRegister from '@/hooks/useRegister';

export default function RegisterNav({ goBack }: { goBack: (e: MouseEvent<HTMLButtonElement>) => void }) {

    const captchaRef = useRef();

    const {
        t,
        strength,
        regEmail,
        regCode,
        regPassword,
        regConfirmPassword,
        registerByEmailMutation,
        showCaptcha, setShowCaptcha,
        handleRegisterChange,
        onSubmitSendCode4Reg,
        onSubmitReg
    } = useRegister();

    function showSlideCaptcha() {
        setShowCaptcha(true);
        // @ts-ignore
        captchaRef.current?.verify();
    }

    return (
        <>
            <form>
                <div className="form-group row">
                    <label className="col-sm-3 col-form-label">{t('email')}</label>
                    <div className="col-sm-6">
                        <input name="regEmail" className="form-control" onChange={handleRegisterChange} />
                    </div>
                    <div className="col-sm-3">
                        <button name="sendVerify" type="button" className="btn btn-outline-primary" onClick={onSubmitSendCode4Reg}><small>{t('sendEmailCode')}</small></button>
                    </div>
                </div>
                <div className="form-group row mt-4">
                    <label className="col-sm-3 col-form-label">{t("captcha")}</label>
                    <div className="col-sm-8">
                        <input className="form-control" type="text" value={regCode} name="regCode"  onChange={handleRegisterChange}/>
                    </div>
                </div>
                <div className="form-group row mt-4">
                    <label className="col-sm-3 col-form-label">{t('password')}</label>
                    <div className="col-sm-8">
                        <input type='password' name="regPassword" value={regPassword} className="form-control" onChange={handleRegisterChange} />
                        {strength>0 && (
                            <div className="row mt-1 ms-1">
                                {strength==1 && <div className='w-15 border border-2 border-secondary'></div>}
                                {strength==2 && (<><div className='w-15 border border-2 border-secondary'></div><div className='w-15 border border-2 border-warning mx-1'></div></>)}
                                {strength==3 && (<><div className='w-15 border border-2 border-secondary'></div><div className='w-15 border border-2 border-warning mx-1'></div><div className='w-15 border border-2 border-danger'></div></>)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-group row mt-4">
                    <label className="col-sm-3 col-form-label">{t('confirmPassword')}</label>
                    <div className="col-sm-8">
                        <input type='password' name="regConfirmPassword" value={regConfirmPassword} className="form-control" onChange={handleRegisterChange} />
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
                <div className='form-row text-center mt-4'>
                    <button name="back" type="button" className="btn btn-outline-secondary me-4"onClick={goBack}>{t('goBack')}</button>
                    <button name="register" disabled={registerByEmailMutation.isLoading} type="button" className="btn btn-outline-primary" onClick={showSlideCaptcha}>{t('register')}</button>
                </div>
            </form>
        </>
    )
}
