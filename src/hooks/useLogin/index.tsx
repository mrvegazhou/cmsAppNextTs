import {
    type ChangeEvent,
    useState,
    useRef
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type JSEncrypt from 'jsencrypt';
import { useTranslations } from 'next-intl';
import useSyncState from '@/hooks/useState';
import { USER_TOKEN } from '@/lib/constant';
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
import { useSetAtom } from 'jotai'
import { userDataAtom } from "@/store/userData";
import { useSearchParams, useRouter } from 'next/navigation'


const useLogin = (close: (()=>void) | null = null) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('LoginPage');
    const setUserData = useSetAtom(userDataAtom);

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
        setEmail(e.target.value);
      } else if(name=="password") {
        setPassword(e.target.value, function (data: string) {
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
  
    const loginByEmailMutation = useMutation({
      mutationFn: async (variables: TBody<ILoginByEmailBody>) => {
         return await loginByEmail(variables);
      }
    });
  
    async function getEncryptedPassword(password: string) {
      try {
        const res = await getPasswordPublicKey() as IData<string>;
        
        if( res.status!=200 ) {
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
        show({
          type: 'DANGER',
          message: t('encryptPasswordFailed'),
        });
      }
    }
  
    async function onSubmit() {
      try {
        checkForm();
        setDisableLogin(true);
        // 加密password
        let encryptedPassword = await getEncryptedPassword(password);
        
        if (typeof encryptedPassword=="undefined") {
          return;
        }

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

        if (loginRes.status != 200 || typeof loginRes.data=="undefined") {

            if (typeof loginRes.data != "undefined" && loginRes.data.captchaVerify == true) {
                setShowCaptcha(true);
                // @ts-ignore
                captchaRef.current?.verify();
            } else {
                show({
                    type: 'DANGER',
                    message: loginRes.message ?? t('loginFailed'),
                });
            }
            return;
        }
        
        show({
          message: t('loginCompleted'),
          type: 'SUCCESS',
        });
        setShowCaptcha(false);
        USER_TOKEN.set({token: loginRes.data.token as string, refreshToken: loginRes.data.refreshToken as string});
        setJToken(loginRes.data.token);
        setUserData(loginRes.data.userInfo);
        setDisableLogin(false);
        // 如果需要返回上一页面
        const backURL = searchParams.get('back');
        if (backURL) {
          router.push(backURL);
        }
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
        if(close) {
          close();
        }
      }
    }

    return {
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
    };
}

export default useLogin;