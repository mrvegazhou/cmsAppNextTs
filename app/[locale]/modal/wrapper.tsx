'use client';

import {
  type Dispatch,
  type MouseEvent,
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
import type Bootstrap from 'bootstrap';
import { createPortal, flushSync } from 'react-dom';
import classNames from 'classnames';
import { AppContext } from '@/contexts/app';
import { nanoid } from 'nanoid';
import { ModalContext } from '@/contexts/modal';
import { useTranslations } from 'use-intl';

export interface IModalProps {
  mid?: string;
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  content?: ReactNode;
  customContent?: ReactNode;
  onConfirm?: (e?: MouseEvent<HTMLButtonElement>) => void;
  isShowHeader?: boolean;
  isShowFooter?: boolean;
  isShowContent?: boolean;
  isStatic?: boolean;
  keyboard?: boolean;
  scrollable?: boolean;
  centered?: boolean;
  small?: boolean;
  large?: boolean;
  extraLarge?: boolean;
  fullscreen?: boolean;
  fullscreenClass?: string;
  focus?: boolean;
  backdrop?: boolean;
  onShown?: () => void | Promise<void>;
  onHidden?: () => void | Promise<void>;
}

interface IModalPropsSuper extends IModalProps {
  id: string;
  isShow: boolean;
}

interface IModalPropsContainer {
  items: IModalPropsSuper[];
}

export default function ModalWrapper(
  this: any,
  { children }: { children: ReactNode },
) {
  const context = useContext(AppContext);
  const [isInit, setIsInit] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const instanceRefs = useRef<Map<string, Bootstrap.Modal>>(new Map());
  const [customModalProps, setCustomModalProps] =
    useState<IModalPropsContainer>({ items: [] });
  const [isLoadingModalShowing, setIsLoadingModalShowing] = useState(false);

  useEffect(() => {
    setIsInit(true);
  }, []);

  const show = useCallback(
    (modalProps: IModalProps = {}) => {
      if (!modalRef.current) {
        throw new Error('Data not available');
      }

      const id = modalProps.mid ?? nanoid();
      flushSync(() => {
        setIsLoadingModalShowing(true);
        setCustomModalProps((prevState) => ({
          ...prevState,
          items: [...prevState.items, { ...modalProps, isShow: true, id }],
        }));
      });

      const find = Array.from(modalRef.current.children).find(
        (value) => value.getAttribute('data-mid') === id,
      );
      if (!find) {
        throw new Error('An error occurred with the component');
      }

      const instance = (
        context.bootstrap ?? window.bootstrap
      ).Modal.getOrCreateInstance(find);
      instanceRefs.current.set(id, instance);
      instance.show();
      return id;
    },
    [context.bootstrap],
  );

  const hide = useCallback((id?: string) => {
    if (!id) {
      console.debug('Failed to destroy the Modal component');
      return;
    }

    setCustomModalProps((prevState) => ({
      ...prevState,
      items: prevState.items.map((item) =>
        item.id === id ? { ...item, isShow: false } : item,
      ),
    }));

    instanceRefs.current.get(id)?.hide();
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isLoadingModalShowing,
        show,
        hide,
      }}
    >
      {children}
      {isInit && (
        <Modal
          hide={hide}
          modalRef={modalRef}
          instanceRefs={instanceRefs}
          customModalProps={customModalProps}
          setCustomModalProps={setCustomModalProps}
          setIsLoadingModalShowing={setIsLoadingModalShowing}
        />
      )}
    </ModalContext.Provider>
  );
}

const Modal = ({
  hide,
  modalRef,
  instanceRefs,
  customModalProps,
  setCustomModalProps,
  setIsLoadingModalShowing,
}: {
  hide: (id: string) => void;
  modalRef: RefObject<HTMLDivElement>;
  instanceRefs: MutableRefObject<Map<string, Bootstrap.Modal>>;
  customModalProps: IModalPropsContainer;
  setCustomModalProps: Dispatch<SetStateAction<IModalPropsContainer>>;
  setIsLoadingModalShowing: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations('Page');
  const lastHiddenId = useRef<string>();

  useEffect(() => {
    const handleOffcanvasShown = async (id: string) => {
      setIsLoadingModalShowing(false);
      await customModalProps.items.find((item) => item.id === id)?.onShown?.();
      instanceRefs.current.get(id)?.handleUpdate();
    };
    const handleOffcanvasHidden = async (id: string) => {
      if (lastHiddenId.current === id) {
        return;
      }

      lastHiddenId.current = id;
      setCustomModalProps((prevState) => {
        const find = prevState.items.find((item) => item.id === id);
        if (find) {
          return {
            ...prevState,
            items: [
              ...prevState.items.filter((item) => item.id !== id),
              {
                ...find,
                isShow: false,
              },
            ],
          };
        }
        return prevState;
      });
      await customModalProps.items.find((item) => item.id === id)?.onHidden?.();
      instanceRefs.current.get(id)?.dispose();
      instanceRefs.current.delete(id);
    };

    const current = modalRef.current;
    if (current) {
      customModalProps.items.forEach((item) => {
        const element = Array.from(current.children).find(
          (value) => value.getAttribute('data-mid') === item.id,
        );
        if (element) {
          element.addEventListener('shown.bs.modal', () =>
            handleOffcanvasShown(item.id),
          );
          element.addEventListener('hidden.bs.modal', () =>
            handleOffcanvasHidden(item.id),
          );
        }
      });
    }

    return () => {
      if (current) {
        customModalProps.items.forEach((item) => {
          const element = Array.from(current.children).find(
            (value) => value.id === item.id,
          );
          if (element) {
            element.removeEventListener('shown.bs.modal', () =>
              handleOffcanvasShown(item.id),
            );
            element.removeEventListener('hidden.bs.modal', () =>
              handleOffcanvasHidden(item.id),
            );
          }
        });
      }
    };
  }, [
    customModalProps.items,
    instanceRefs,
    modalRef,
    setCustomModalProps,
    setIsLoadingModalShowing,
  ]);

  return createPortal(
    <div ref={modalRef}>
      {customModalProps.items.map((item) => {
        const {
          title,
          header,
          footer,
          content,
          customContent,
          onConfirm,
          isShowHeader = true,
          isShowFooter = true,
          isShowContent = true,
          isStatic = true,
          keyboard = true,
          scrollable = true,
          centered = true,
          small,
          large,
          extraLarge,
          fullscreen,
          fullscreenClass,
          focus = true,
          backdrop = true,
          isShow,
          id,
        } = item;

        return (
          <div
            key={item.id}
            className="modal fade"
            aria-labelledby={title ? title : 'modal'}
            aria-hidden={isShow ? 'false' : 'true'}
            data-mid={id}
            data-bs-keyboard={keyboard ? 'true' : 'false'}
            data-bs-backdrop={isStatic ? 'static' : 'false'}
            data-bs-config={JSON.stringify({
              focus: focus ?? true,
              keyboard: keyboard ?? true,
              delay: backdrop ?? true,
            })}
          >
            <div
              className={classNames(
                'modal-dialog',
                {
                  'modal-dialog-scrollable': scrollable,
                  'modal-dialog-centered': centered,
                  'modal-sm': small,
                  'modal-lg': large,
                  'modal-xl': extraLarge
                    ? extraLarge
                    : !small && !large && !extraLarge,
                  'modal-fullscreen': fullscreen,
                },
                fullscreenClass,
              )}
            >
              {customContent ? (
                <div className="modal-content">{customContent}</div>
              ) : (
                <div className="modal-content">
                  {isShowHeader && (
                    <div className="modal-header">
                      {header ? (
                        header
                      ) : (
                        <>
                          <h5 className="modal-title">{title || '...'}</h5>
                          <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={hide.bind(this, id)}
                          ></button>
                        </>
                      )}
                    </div>
                  )}
                  {isShowContent && (
                    <div className="modal-body">{content || '...'}</div>
                  )}
                  {isShowFooter && (
                    <div className="modal-footer">
                      {footer ? (
                        footer
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={hide.bind(this, id)}
                          >
                            {t('close')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={
                              onConfirm ? onConfirm : hide.bind(this, id)
                            }
                          >
                            {t('confirm')}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
};
