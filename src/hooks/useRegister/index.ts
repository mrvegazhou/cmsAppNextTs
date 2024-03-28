import { useMutation } from '@tanstack/react-query';
import {
    type ChangeEvent,
    useEffect,
    useState,
    useRef,
} from 'react';
import { useTranslations } from 'next-intl';
import type JSEncrypt from 'jsencrypt';
import type {
    IData,
    ISendEmailCode,
    IRegisterByEmailBody
} from '@/interfaces';
import type { TBody } from '@/types';
import {
    sendEmailCode,
    getPasswordPublicKey,
    registerByEmail
} from '@/services/api';
import useToast from '@/hooks/useToast';
import useSyncState from '@/hooks/useState';
import { isEmail, isPassword, isPasswordLen, getJsEncrypt } from '@/lib/tool';

const useRegister = () => {
    const { show } = useToast();
    const t = useTranslations('LoginPage');
    const jsEncryptRef = useRef<JSEncrypt>();

    // 注册
    const [regEmail, setRegEmail] = useSyncState("");
    const [regCode, setRegCode] = useSyncState("");
    const [regPassword, setRegPassword] = useSyncState("");
    const [regConfirmPassword, setRegConfirmPassword] = useSyncState("");

    const [strength, setStrength] = useState<number>(0);

    const [showCaptcha, setShowCaptcha] = useState(false);


    function handleRegisterChange(e: ChangeEvent<HTMLInputElement>) {
        let name = e.target.name;
        if( name=="regEmail" ) {
            setRegEmail(e.target.value);
        } else if( name=="regCode" ) {
            setRegCode(e.target.value);
        } else if( name=="regPassword" ) {
            setRegPassword(e.target.value, function (data: any) {
                setStrength(isPassword(data).strength);
            });
        } else if( name=="regConfirmPassword" ) {
            setRegConfirmPassword(e.target.value);
        }
    }

    async function getEncryptedPassword(password: string) {
        try {
            const jsEncrypt = await getJsEncrypt(jsEncryptRef);
            const res = await getPasswordPublicKey() as IData<string>;
            if (res.status != 200) {
                throw t('encryptPasswordFailed');
            }
            let publicKeyStr = res.data;
            if (!publicKeyStr) {
                throw t('encryptPasswordFailed');
            }
            jsEncrypt.setPublicKey(publicKeyStr);
            const encryptedData = jsEncrypt.encrypt(password);
            if (!encryptedData) {
                throw t('encryptPasswordFailed');
            }
            return encryptedData;
        } catch (e) {
            show({
                type: 'DANGER',
                message: t('encryptPasswordFailed'),
            });
        }
    }

    // 注册
    const registerByEmailMutation = useMutation({
        mutationFn: async (variables: TBody<IRegisterByEmailBody>) => {
           return await registerByEmail(variables);
        }
    });

    async function onSubmitReg() {
        try {
            if (regEmail=="") {
                throw t('enterNotNullEmail');
            }
            if (!isEmail(regEmail)) {
                throw t('enterValidEmail');
            }
            if (regCode=="") {
                throw t('enterNotNullCode');
            }            
            if (!isPasswordLen(regPassword)) {
                throw t('passwordLengthSupport');
            }
            if (!isPassword(regPassword).isValid) {
                throw t('passwordError');
            }
            if (regPassword!=regConfirmPassword) {
                throw t('passwordError');
            }
            let encryptedRegPassword = await getEncryptedPassword(regPassword);
            let encryptedRegConfirmPassword = await getEncryptedPassword(regConfirmPassword);

            const body = {
                email: regEmail,
                code: regCode,
                password: encryptedRegPassword,
                confirmPassword: encryptedRegConfirmPassword
            } as IRegisterByEmailBody;
            let res = await registerByEmailMutation.mutateAsync({data: body}) as IData<IRegisterByEmailBody>;
            if( res.status!=200 ) {
                throw res.message;
            }
            show({
                type: 'SUCCESS',
                message: t('registerSuccess'),
            });
        } catch (e: any) {
            registerByEmailMutation.reset();
            show({
                type: 'DANGER',
                message: e,
            });
        } finally {

        }
    }

    const sendEmailCodeMutation = useMutation({
        mutationFn: async (variables: TBody<ISendEmailCode>) => {
          return (await sendEmailCode(
            variables,
          )) as IData<any>;
        },
    });

    async function onSubmitSendCode4Reg() {
        try {
            if (regEmail=="") {
                throw t('enterEmail');
            }
            if (!isEmail(regEmail)) {
                throw t('enterValidEmail');
            }
            let sendRes = await sendEmailCodeMutation.mutateAsync({data: {email: regEmail, codeType:2}}) as IData<any>;
            if( sendRes.status!=200 ) {
                if (sendRes.data.captchaVerify != undefined && sendRes.data.captchaVerify == true) {
                    setShowCaptcha(true);
                    // @ts-ignore
                    captchaRef.current?.verify();
                    return;
                }
                throw sendRes.message;
            }
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

    return {
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
    }

}
export default useRegister;