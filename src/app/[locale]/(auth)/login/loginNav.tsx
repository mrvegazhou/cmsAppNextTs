'use client';

import {
    type MouseEvent,
    useCallback,
    useEffect,
    useState,
    memo,
    useRef,
    forwardRef,
    useImperativeHandle
} from 'react';
import RegisterNav from '../register/registerNav';
import LoginForgetNav from './loginForgetNav';
import Captcha from '@/components/captcha/Captcha';
import useLogin from '@/hooks/useLogin';
import Modal from '@/components/modal';
import useClickOutside from '@/hooks/useClick/useClickOutside';

const LoginNav = () => {

    let loginRef = useRef();

    const showLoginModal = () => {
        // @ts-ignore
        loginRef.current && loginRef.current.setOpen(true);
    };

    return (
      <>
        <a className="nav-link" role="button" onClick={showLoginModal}>
            <i className='iconfont icon-denglu fs-3 text-black-50'></i>
        </a>
        <LoginModal ref={loginRef}/>
      </>
    );
};
export default memo(LoginNav);

export const LoginModal = forwardRef((props: {isOpen?: boolean}, ref) => {
    
    // 显示忘记密码
    const [showForgetPwd, setShowForgetPwd] = useState(false);
    // 显示注册
    const [showRegister, setShowRegister] = useState(false);
    // 显示登录框
    const [showLoginForm, setShowLoginForm] = useState(false);

    useEffect(() => {        
        resetLoginFormModal();
    }, []);

    useEffect(() => {
        setOpen(props.isOpen!);
    }, [props.isOpen]);

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


    const [open, setOpen] = useState<boolean>(false);
    useImperativeHandle(ref, () => ({ setOpen: setOpen }));
    // 关闭modal
    function onClickCloseModal() {
        setOpen(false);
    }

    function clearInput() {
        // @ts-ignore
        emailInputRef.current && (emailInputRef.current.value = '');
        // @ts-ignore
        passwordInputRef.current && (passwordInputRef.current.value = '');
        setEmail("");
        setPassword("");
    }
  
    function resetLoginFormModal() {
        clearInput();
        setShowLoginForm(true);
        setShowRegister(false);
        setShowForgetPwd(false);
        setStrength(0);
        setOpen(false);
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
        <Modal
            title={t('login')}
            isOpen={open}
            onClosed={()=>{setOpen(false);}}
            type="light"
            useButton={false}
            minWidth={600}
        >
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
                            <input name="email" ref={emailInputRef} defaultValue={email} className="form-control" onChange={handleChange}/>
                        </div>
                    </div>
                    <div className="form-group row mt-4">
                        <label className="col-sm-3 col-form-label">{t('password')}</label>
                        <div className="col-sm-8">
                        <input name="password" ref={passwordInputRef} defaultValue={password} type="password" className="form-control col-sm-10" onChange={handleChange}/>
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
        </Modal>
    );
});
LoginModal.displayName = "LoginModal";

