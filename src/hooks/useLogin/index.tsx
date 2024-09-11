import {
    type ChangeEvent,
    useState,
    useRef,
    useCallback
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type JSEncrypt from 'jsencrypt';
import { useTranslations } from 'next-intl';
import useSyncState from '@/hooks/useState';
import { PWD_STRENGTH, USER_TOKEN } from '@/lib/constant';
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
import { useAtomValue, useSetAtom } from 'jotai'
import { goBackAtom, loginAtom, userDataAtom } from "@/store/userData";
import { useSearchParams, useRouter } from 'next/navigation'


const useLogin = (close: (()=>void) | null = null) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('LoginPage');
    const setUserData = useSetAtom(userDataAtom);
    // 401显示登录弹窗的atom
    const setLoginIdent = useSetAtom(loginAtom);
    const goBackURL = useAtomValue(goBackAtom);

    const [disableLogin, setDisableLogin] = useState(false);
    const [email, setEmail] = useSyncState("");
    const [password, setPassword] = useSyncState("");
    const [strength, setStrength] = useState<number>(PWD_STRENGTH.WEAK);
    const [showCaptcha, setShowCaptcha] = useState(false);

    const jsEncryptRef = useRef<JSEncrypt>();
    const captchaRef = useRef();

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const { show } = useToast();

    const [jToken, setJToken] = useState("");
  
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      let name = e.target.name;
      if(name=="email") {
        setEmail(e.target.value);
      } else if(name=="password") {
        setPassword(e.target.value, function (data: string) {
          setStrength(isPassword(data).strength);
        });
      }
    }, []);
  
    const checkForm = useCallback(() => {
      if (!email) {
        throw t('enterNotNullEmail');
      } else if (!isEmail(email)) {
        throw t('enterValidEmail');
      }
      if (!password) {
        throw t('enterNotNullPassword');
      } else if (!isPasswordLen(password)) {
        throw t('passwordLengthSupport');
      } else if (!isPassword(password).isValid) {
        throw t('passwordError');
      }
    }, [email, password]);
  
    const loginByEmailMutation = useMutation({
      mutationFn: async (variables: TBody<ILoginByEmailBody>) => {
         return await loginByEmail(variables);
      }
    });
  
    const getEncryptedPassword = useCallback(async (password: string) => {
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
    }, [jsEncryptRef]);
  
    // 提交登录 密码 12345A@a
    const onSubmit = useCallback(async () => {
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
        setLoginIdent(false);
        setShowCaptcha(false);
        USER_TOKEN.set({token: loginRes.data.token as string, refreshToken: loginRes.data.refreshToken as string});
        setJToken(loginRes.data.token);
        setUserData(loginRes.data.userInfo);
        setDisableLogin(false);
        // 如果需要返回上一页面 判断是否地址栏里携带和存储在jotai里
        let backURL = searchParams.get('back');
        
        if (backURL=="" || null==backURL) {
          backURL = goBackURL;
        }
        if (backURL) {
          // router.push(backURL);
        }
        if(close) {
          close();
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
      }
    }, [email, password, close]);

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