
import useLoginForget from '@/hooks/useLogin/forget';
import Captcha from '@/components/captcha/Captcha';

export default function LoginForget({ email }: { email: string }) {
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

    return (
        <>
            <div className="my-3">
                <label className="form-label"><span className="text-danger fw-bold">*</span>{t('email')}</label>
                <div className="hstack">
                    <div className="col-sm-8">
                        <input name="email" disabled={!showEmailInput} className="form-control" value={email4Forget} onChange={handleVerifyCodeChange} />
                    </div>
                    <div className="ms-3 col-sm-3">
                        <button name="sendVerify" disabled={sendEmailCodeMutation.isLoading} type="button" className="btn btn-outline-primary" onClick={onSubmitSendCode4ForgetPwd}><small>{t('sendEmailCode')}</small></button>
                    </div>
                </div>
            </div>
            <div className="my-3">
                <label className="form-label"><span className="text-danger fw-bold">*</span>{t('captcha')}</label>
                <div className="col-sm-10">
                    <input name="verifyCode" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="my-3">
                <label className="form-label"><span className="text-danger fw-bold">*</span>{t('password')}</label>
                <div className="col-sm-10">
                    <input name="forgetPassword" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="my-3">
                <label className="form-label"><span className="text-danger fw-bold">*</span>{t('confirmPassword')}</label>
                <div className="col-sm-10">
                    <input name="forgetConfirmPassword" disabled={!showVerifyCode} className="form-control" onChange={handleVerifyCodeChange} />
                </div>
            </div>
            <div className="my-3">
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
                <button name="confirmVerify" disabled={changeNewPwdByEmailCodeMutation.isLoading} type="button" className="w-50 btn btn-outline-primary " onClick={onSubmitChangePwdByEmailCode}>{t('modifyPassword')}</button>
            </div>    
        </>
    );
}