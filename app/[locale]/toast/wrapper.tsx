'use client';

import {
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ToastContext } from '@/contexts/toast';
import type Bootstrap from 'bootstrap';
import { createPortal, flushSync } from 'react-dom';
import classNames from 'classnames';
import { AppContext } from '@/contexts/app';
import { parseMessage } from '@/lib/tool';
import { nanoid } from 'nanoid';
import { useTranslations } from 'use-intl';
import { IToastsProps, IToastProps } from '@/interfaces';


export default function ToastWrapper(
    this: any,
    { children }: { children: ReactNode },
  ) {
    const toastsRef = useRef<HTMLDivElement>(null);
    const instanceRefs = useRef<Map<string, Bootstrap.Toast>>(new Map());
    const [customToastsProps, setCustomToastsProps] = useState<IToastsProps>({
      toasts: [],
    });
    const [isLoadingToastShowing, setIsLoadingToastShowing] = useState(false);
    const context = useContext(AppContext);
    const [isInit, setIsInit] = useState(false);
  
    useEffect(() => {
      setIsInit(true);
    }, []);

    useEffect(() => {
      if (customToastsProps.toasts.length > 15) {
        setCustomToastsProps({
          ...customToastsProps,
          toasts: customToastsProps.toasts.filter((item) => {
            instanceRefs.current.delete(item.id);
            return item.isShow;
          }),
        });
      }
    }, [customToastsProps]);
  
    const show = useCallback(
      (toastProps: IToastProps = {}) => {
        if (!toastsRef.current) {
          throw new Error('Data not available');
        }
  
        const id = nanoid();
        flushSync(() => {
          setIsLoadingToastShowing(true);
          setCustomToastsProps((prevState) => ({
            ...prevState,
            toasts: [...prevState.toasts, { ...toastProps, isShow: true, id }],
          }));
        });
  
        const find = Array.from(toastsRef.current.children).find(
          (value) => value.getAttribute('data-tid') === id,
        );
        if (!find) {
          throw new Error('The message indicates that an error has occurred');
        }
  
        const instance = (
          context.bootstrap ?? window.bootstrap
        ).Toast.getOrCreateInstance(find);
        instanceRefs.current.set(id, instance);
        instance.show();
        return id;
      },
      [context.bootstrap],
    );
  
    const hide = useCallback((id: string) => {
      setCustomToastsProps((prevState) => ({
        ...prevState,
        toasts: prevState.toasts.map((item) =>
          item.id === id ? { ...item, isShow: false } : item,
        ),
      }));
  
      instanceRefs.current.get(id)?.hide();
    }, []);
  
    return (
      <ToastContext.Provider
        value={{
          isLoadingToastShowing,
          show,
          hide,
        }}
      >
        {children}
  
        {isInit && (
          <Toasts
            hide={hide}
            toastsRef={toastsRef}
            instanceRefs={instanceRefs}
            customToastsProps={customToastsProps}
            setCustomToastsProps={setCustomToastsProps}
            setIsLoadingToastShowing={setIsLoadingToastShowing}
          />
        )}
      </ToastContext.Provider>
    );
}


const Toasts = ({
    hide,
    toastsRef,
    instanceRefs,
    customToastsProps,
    setCustomToastsProps,
    setIsLoadingToastShowing,
  }: {
    hide: (id: string) => void;
    toastsRef: RefObject<HTMLDivElement>;
    instanceRefs: MutableRefObject<Map<string, Bootstrap.Toast>>;
    customToastsProps: IToastsProps;
    setCustomToastsProps: Dispatch<SetStateAction<IToastsProps>>;
    setIsLoadingToastShowing: Dispatch<SetStateAction<boolean>>;
  }) => {
    const t = useTranslations('Page');
    const lastHiddenId = useRef<string>();
  
    useEffect(() => {
      const handleToastShown = async (id: string) => {
        setIsLoadingToastShowing(false);
        await customToastsProps.toasts
          .find((item) => item.id === id)
          ?.onShown?.();
      };
      const handleToastHidden = async (id: string) => {
        if (lastHiddenId.current === id) {
          return;
        }

        lastHiddenId.current = id;
        setCustomToastsProps((prevState) => {
          const find = prevState.toasts.find((item) => item.id === id);
          if (find) {
            return {
              ...prevState,
              toasts: [
                ...prevState.toasts.filter((item) => item.id !== id),
                {
                  ...find,
                  isShow: false,
                },
              ],
            };
          }
          return prevState;
        });
        await customToastsProps.toasts
          .find((item) => item.id === id)
          ?.onHidden?.();
        instanceRefs.current.get(id)?.dispose();
        instanceRefs.current.delete(id);
      };
  
      const current = toastsRef.current;
      if (current) {
        customToastsProps.toasts.forEach((item) => {
          const element = Array.from(current.children).find(
            (value) => value.getAttribute('data-tid') === item.id,
          );
          if (element) {
            element.addEventListener('shown.bs.toast', () =>
              handleToastShown(item.id),
            );
            element.addEventListener('hidden.bs.toast', () =>
              handleToastHidden(item.id),
            );
          }
        });
      }
  
      return () => {
        if (current) {
          customToastsProps.toasts.forEach((item) => {
            const element = Array.from(current.children).find(
              (value) => value.id === item.id,
            );
            if (element) {
              element.removeEventListener('shown.bs.toast', () =>
                handleToastShown(item.id),
              );
              element.removeEventListener('hidden.bs.toast', () =>
                handleToastHidden(item.id),
              );
            }
          });
        }
      };
    }, [
      customToastsProps.toasts,
      instanceRefs,
      setCustomToastsProps,
      setIsLoadingToastShowing,
      toastsRef,
    ]);
  
    return createPortal(
      <div
        ref={toastsRef}
        className={classNames(
          'toast-container position-fixed p-3',
          customToastsProps.toastContainerClass
            ? customToastsProps.toastContainerClass
            : 'top-0 start-50 translate-middle-x',
        )}
      >
        {customToastsProps.toasts.map((toast) => {
          const {
            title,
            header,
            content = '...',
            customContent,
            isShowHeader = true,
            isShowContent = true,
            toastClass,
            autohide = true,
            animation = true,
            delay = 5000,
            type,
            message,
            isShow,
            id,
          } = toast;
  
          return (
            <div
              key={id}
              className={classNames('toast', toastClass)}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              aria-labelledby={title ? title : 'toast'}
              aria-hidden={isShow ? 'false' : 'true'}
              data-tid={id}
              data-bs-config={JSON.stringify({
                autohide: autohide ?? true,
                animation: animation ?? true,
                delay: delay ?? 5000,
              })}
            >
              {customContent ? (
                <div className="toast-body">{customContent}</div>
              ) : (
                <>
                  {isShowHeader &&
                    (header ? (
                      header
                    ) : (
                      <div className="toast-header">
                        <div
                          className={classNames('rounded me-2 p-2', {
                            'bg-danger':
                              type === 'error' ||
                              type === 'ERROR' ||
                              type === 'DANGER',
                            'bg-success':
                              type === 'success' || type === 'SUCCESS',
                            'bg-info': type === 'info' || type === 'INFO',
                            'bg-primary':
                              type === 'primary' || type === 'PRIMARY' || !type,
                            'bg-secondary':
                              type === 'secondary' || type === 'SECONDARY',
                            'bg-warning':
                              type === 'warning' || type === 'WARNING',
                            'bg-light': type === 'light' || type === 'LIGHT',
                          })}
                        ></div>
                        <strong className="me-auto">
                          {title ? title : t('warmReminder')}
                        </strong>
                        <button
                          onClick={hide.bind(this, id)}
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                        ></button>
                      </div>
                    ))}
  
                  {isShowContent && (
                    <div className="toast-body">
                      {message ? parseMessage(message) : content}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>,
      document.body,
    );
};