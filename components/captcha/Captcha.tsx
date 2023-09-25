import type { FC } from 'react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { CaptchaModel, CaptchaProps, CaptchaType } from './PropsType';
import { aesEncrypt, Anchor, CODE, createNamespace, noop, storage } from '@/components/captcha/utils';
import useSetState from '@/hooks/useSetState';
import { picture4Captcha, check4Captcha } from '@/services/api/captcha'
import type { IData } from '@/interfaces';
import classNames from 'classnames';
import Loading from '@/components/captcha/loading';
import Slider from '@/components/captcha/slider';
import Points from '@/components/captcha/points';
import Popup from '@/components/captcha/popup';
import Icon from '@/components/captcha/icon';
import useToast from '@/hooks/useToast';

const [bem] = createNamespace('captcha');

const Captcha: FC<CaptchaProps> = forwardRef(({
    type = 'auto',
    email= "",
    mode="",
    popup="",
    onCancel = noop,
    onFail = noop,
    onSuccess = noop,
    className = "",
    style,
    children
}, ref) => {
    const [visible, toggle] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [captcha, setCaptcha] = useState<CaptchaModel>({});
    const [state, setState] = useSetState<{
        count: number, captchaType: CaptchaType
    }>({
        count: 0,
        captchaType: type,
    });
    const { count, captchaType } = state;

    useEffect(() => {
        if (count > 0) {
          fetch();
        }
    }, [count]);

    const fetch = async () => {
        toggle(true);
        const vr = Anchor[captchaType];
        const res = await picture4Captcha({data:{
          captchaType: vr.captchaType,
          clientUid: localStorage.getItem(vr.name),
          ts: Date.now(),
        }}) as IData<any>;
        const msg = res.msg || '请刷新页面再试';
        if (res.code ==200) {
          setError('')
          setCaptcha(vr.data(res.data));
        } else {
          setError(msg);
          onFail(msg);
        }
    };

    const fail = () => {
        const c = count + 1;
        setState({ count: c });
        // if (c > 2 && captchaType === 'auto') {
        //   setState({
        //     count: c, captchaType: 'point',
        //   });
        // } else {
        //   setState({ count: c });
        // }
    };

    const success = (data: any) => {
        setTimeout(() => {
          onSuccess(data);
          toggle(false);
          setCaptcha({});
        }, 1000);
    };
    
    const { show } = useToast();
    const valid = (param: string, second: any) => {
        return new Promise<boolean>((resolve) => {
          const vr = Anchor[captchaType];
          const data = {
            mode: mode,
            email: email,
            captchaType: vr.captchaType,
            pointJson: captcha.secretKey
              ? aesEncrypt(param, captcha.secretKey)
              : param,
            token: captcha.token,
            clientUid: localStorage.getItem(vr.name),
            ts: Date.now(),
          };
          check4Captcha({data:data})
            .then((res) => {
                res = res as IData<any>;
                const validate: boolean = res.code === 200;
                if (validate) {
                    success(second);
                } else {
                    show({
                        type: 'DANGER',
                        message: res.msg,
                    });
                    fail();
                }
                resolve(validate);
            })
            .catch(() => resolve(false));
        });
    };

    useImperativeHandle(ref, () => ({ verify: fetch }));

    const cancel = () => {
        onFail("用户取消");
        if(popup=="force") {
            return;
        }
        toggle(false);
        onCancel();
    };

    useEffect(() => {
        storage();
    }, []);

    const renderBody = () => {
        if (error.length > 0) {
          return <div className={classNames(bem('error'))}>
            <div className={classNames(bem('icon'))}>
               <div className={classNames(bem('icon-wrap'))}>
                    <Icon size={32} name='failure' color='#fff' />
               </div>
            </div>
            <div className={classNames(bem('text'))}>
              {error}
            </div>
          </div>;
        }
        if (!captcha.image) {
          return <Loading />;
        }
        if (['auto', 'slide'].includes(captchaType)) {
          return <Slider onValid={valid} captcha={captcha} />;
        }
        return <Points onValid={valid} captcha={captcha} />;
      };
      return (
        <div className={classNames(bem(), className)} style={style}>
          <Popup visible={visible} onCancel={cancel}>
            {renderBody()}
          </Popup>
          {children}
        </div>
      );
});

export default Captcha;