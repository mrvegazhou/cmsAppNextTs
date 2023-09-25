import {
    type ChangeEvent,
    useState,
    useRef,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';
import type JSEncrypt from 'jsencrypt';
import { isEmail, isPassword, isPasswordLen, getJsEncrypt } from '@/lib/tool';
import { SEND_EMAIL_CODE_MODE, CHANAGE_PWD_BY_EMAIL_CODE } from '@/lib/constant';
import type {
    IChangePwdByEmailCode,
    ISendEmailCode,
    IData,
  } from '@/interfaces';

import useToast from '@/hooks/useToast';
import useSyncState from '@/hooks/useState';
import type { TBody } from '@/types';
import {
  sendEmailCode,
  getPasswordPublicKey,
  changeNewPwdByEmailCode
} from '@/services/api';

const useLoginForget = (email: string) => {
    const jsEncryptRef = useRef<JSEncrypt>();
    const { show } = useToast();
    const t = useTranslations('LoginPage');

    // 显示验证码input
    const [showVerifyCode, setShowVerifyCode] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [email4Forget, setEmail4Forget] = useSyncState(email);
    const [pkey, setPkey] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const captchaRef = useRef();
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [modeType, setModeType] = useState(SEND_EMAIL_CODE_MODE);


    const sendEmailCodeMutation = useMutation(
        async (variables: TBody<ISendEmailCode>) => {
          return (await sendEmailCode(
            variables,
          )) as IData<any>;
        },
    );

    async function onSubmitSendCode4ForgetPwd() {
        try {
            if (email4Forget=="") {
                throw t('enterEmail');
            }
            if (!isEmail(email4Forget)) {
                throw t('enterValidEmail');
            }
            let sendRes = await sendEmailCodeMutation.mutateAsync({data: {email:email4Forget, codeType:1}}) as IData<any>;
            if( sendRes.code!=200 ) {
                if (sendRes.data.captchaVerify != undefined && sendRes.data.captchaVerify == true) {
                    await setModeType(SEND_EMAIL_CODE_MODE);
                    await setShowCaptcha(true);
                    // @ts-ignore
                    captchaRef.current?.verify();
                    return;
                }
                throw sendRes.msg;
            }
            setShowVerifyCode(true);
            setShowEmailInput(false);
            show({
                type: 'SUCCESS',
                message: t('sendCaptchaCompleted'),
            });
        } catch (e: any) {
            sendEmailCodeMutation.reset();
            show({
                type: 'DANGER',
                message: e,
            });
        } finally {

        }
    }

    const queryPasswordPublicKeyMutation = useMutation(async () => {
        return (await getPasswordPublicKey()) as IData<string>;
    });

    async function getEncryptedPassword(password: string, publicKeyStr: string) {
        try {
            let publicKey;
            if (publicKeyStr!="") {
                publicKey = publicKeyStr;
            } else {
                const res = await queryPasswordPublicKeyMutation.mutateAsync();
                if( res.code!=200 ) {
                    throw t('encryptPasswordFailed');
                }
                publicKey = res.data;
                if (!publicKey) {
                    throw t('encryptPasswordFailed');
                }
                setPkey(publicKey);
            }
            const jsEncrypt = await getJsEncrypt(jsEncryptRef);
            jsEncrypt.setPublicKey(publicKey);
            const encryptedData = jsEncrypt.encrypt(password);
            if (!encryptedData) {
                throw t('encryptPasswordFailed');
            }
            return encryptedData;
        } catch (e) {
            queryPasswordPublicKeyMutation.reset();
            show({
                type: 'DANGER',
                message: t('encryptPasswordFailed'),
            });
        }
    }

    async function onSubmitChangePwdByEmailCode() {
        try {
            if (verifyCode=="") {
                throw t('sendEmailCodeNullErr');
            }
            if (!isEmail(email4Forget)) {
                throw t('enterValidEmail');
            }
            if (!isPasswordLen(newPassword)) {
                throw t('passwordLengthSupport');
            }
            if (isPassword(newPassword)<3) {
                throw t('passwordError');
            }
            if (newPassword!=newConfirmPassword) {
                throw t('confirmPasswordError');
            }
            let encryptedNewPassword = await getEncryptedPassword(newPassword, pkey);
            let encryptedNewConfirmPassword = await getEncryptedPassword(newConfirmPassword, pkey);
            const body = {
                email: email4Forget,
                code: verifyCode,
                newPassword: encryptedNewPassword,
                newConfirmPassword: encryptedNewConfirmPassword
            } as any;
            let verifyRes = await changeNewPwdByEmailCodeMutation.mutateAsync({data: body}) as IData<any>;
            if( verifyRes.code!=200 ) {
                throw verifyRes.msg;
            }
            if (verifyRes.data.captchaVerify != undefined && verifyRes.data.captchaVerify == true) {
                await setModeType(CHANAGE_PWD_BY_EMAIL_CODE);
                await setShowCaptcha(true);
                // @ts-ignore
                captchaRef.current?.verify();
                return;
            }
            setShowVerifyCode(false);
            setShowEmailInput(true);
            show({
                type: 'SUCCESS',
                message: t('verifyEmailCodeSuccess'),
            });
            setShowCaptcha(false);
        } catch (e: any) {
            changeNewPwdByEmailCodeMutation.reset();
            setShowCaptcha(false);
            show({
                type: 'DANGER',
                message: e,
            });
        } finally {

        }
    }

    const changeNewPwdByEmailCodeMutation = useMutation(
        async (variables: TBody<IChangePwdByEmailCode>) => {
            return (await changeNewPwdByEmailCode(
              variables,
            )) as IData<any>;
        },
    );

    function handleVerifyCodeChange(e: ChangeEvent<HTMLInputElement>) {
        let name = e.target.name;
        if( name=="email" ) {
            setEmail4Forget(e.target.value);
        } else if( name=="verifyCode" ) {
            setVerifyCode(e.target.value);
        } else if( name=="forgetPassword" ) {
            setNewPassword(e.target.value);
        } else if( name=="forgetConfirmPassword" ) {
            setNewConfirmPassword(e.target.value);
        }
    }

    function verifySuccess() {
        if(modeType==SEND_EMAIL_CODE_MODE) {
            onSubmitSendCode4ForgetPwd();
        } else if(modeType==CHANAGE_PWD_BY_EMAIL_CODE) {
            onSubmitChangePwdByEmailCode();
        }
    }

    return {
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
    }
}

export default useLoginForget;