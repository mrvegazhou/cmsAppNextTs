import {
    type ChangeEvent,
    useState,
    useRef
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type JSEncrypt from 'jsencrypt';
import { useTranslations } from 'use-intl';
import useSyncState from '@/hooks/useState';
import { USER_TOKEN } from '@/lib/constant/cookie';
import { isEmail, isPassword, isPasswordLen, getJsEncrypt } from '@/lib/tool';
import {
    loginByEmail,
    getPasswordPublicKey
} from '@/services/api';
import type {
    ILoginByEmailBody,
    IData
} from '@/interfaces';
import useToast from '@/hooks/useToast';
import type { TBody } from '@/types';

const useLogin = () => {
    const t = useTranslations('LoginPage');
    const [disableLogin, setDisableLogin] = useState(false);
    const [email, setEmail] = useSyncState("");
    const [password, setPassword] = useSyncState("");
    const [strength, setStrength] = useState<number>(0);
    const [showCaptcha, setShowCaptcha] = useState(false);

    const jsEncryptRef = useRef<JSEncrypt>();
    const captchaRef = useRef();

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const { show } = useToast();

    const [jToken, setJToken] = useState("");
  
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      let name = e.target.name;
      if(name=="email") {
        setEmail(e.target.value)
      } else if(name=="password") {
        setPassword(e.target.value, function (data: any) {
          setStrength(isPassword(data));
        });
      }
    }
  
    function checkForm() {
      if (!email) {
        throw t('enterNotNullEmail');
      } else if (!isEmail(email)) {
        throw t('enterValidEmail');
      }
      if (!password) {
        throw t('enterNotNullPassword');
      } else if (!isPasswordLen(password)) {
        throw t('passwordLengthSupport');
      } else if (isPassword(password)<3) {
        throw t('passwordError');
      }
    }
  
    const loginByEmailMutation = useMutation(
      async (variables: TBody<ILoginByEmailBody>) => {
         return await loginByEmail(variables);
      }
    );
  
    const queryPasswordPublicKeyMutation = useMutation(async () => {
      return (await getPasswordPublicKey()) as IData<string>;
    });
  
    async function getEncryptedPassword(password: string) {
      try {
        const res = await queryPasswordPublicKeyMutation.mutateAsync();
        if( res.code!=200 ) {
          throw t('encryptPasswordFailed');
        }
        let publicKey = res.data;
        if (!publicKey) {
          throw t('encryptPasswordFailed');
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
  
    async function onSubmit() {
      try {
        checkForm();

        // 加密password
        let encryptedPassword = await getEncryptedPassword(password);
        const body = {
          email,
          password: encryptedPassword,
        } as any;
        if (!Object.keys(body).length) {
          show({
            type: 'DANGER',
            message: t('loginFailed'),
          });
          return;
        }
  
        let loginRes = await loginByEmailMutation.mutateAsync({data: body}) as IData<any>;
        setDisableLogin(true);
        if (loginRes.code != 200) {
            if (loginRes.data.captchaVerify != undefined && loginRes.data.captchaVerify == true) {
                setShowCaptcha(true);
                // @ts-ignore
                captchaRef.current?.verify();
            } else {
                show({
                    type: 'DANGER',
                    message: loginRes.msg,
                });
            }
            return;
        }
        
        show({
          message: t('loginCompleted'),
          type: 'SUCCESS',
        });
        setShowCaptcha(false);
        USER_TOKEN.set({token: loginRes.data.Jtoken, refreshToken: loginRes.data.Retoken});
        setJToken(loginRes.data.Jtoken);

      } catch (e: any) {
        loginByEmailMutation.reset();
        setDisableLogin(false);
        setShowCaptcha(false);
        show({
          type: 'DANGER',
          message: e,
        });
      } finally {
        setDisableLogin(false);
      }
    }

    return {
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
    };
}

export default useLogin;