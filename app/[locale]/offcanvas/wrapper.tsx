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
import type Bootstrap from 'bootstrap';
import { createPortal, flushSync } from 'react-dom';
import classNames from 'classnames';
import { AppContext } from '@/contexts/app';
import { OffcanvasContext } from '@/contexts/offcanvas';
import { nanoid } from 'nanoid';
import { IOffcanvasPropsContainer, IOffcanvasProps } from '@/interfaces';


export default function OffcanvasWrapper(
    this: any,
    { children }: { children: ReactNode },
) {
    const context = useContext(AppContext);
    const [isInit, setIsInit] = useState(false);
    const offcanvasRef = useRef<HTMLDivElement>(null);
    const instanceRefs = useRef<Map<string, Bootstrap.Offcanvas>>(new Map());
    const [customOffcanvasProps, setCustomOffcanvasProps] = useState<IOffcanvasPropsContainer>({ items: [] });
    const [isLoadingOffcanvasShowing, setIsLoadingOffcanvasShowing] = useState(false);
  
    useEffect(() => {
      setIsInit(true);
    }, []);
  
    const show = useCallback(
      (offcanvasProps: IOffcanvasProps = {}) => {
        if (!offcanvasRef.current || !context.bootstrap) {
          throw new Error('Data not available');
        }
  
        const id = nanoid();
        flushSync(() => {
          setIsLoadingOffcanvasShowing(true);
          setCustomOffcanvasProps((prevState) => ({
            ...prevState,
            items: [...prevState.items, { ...offcanvasProps, isShow: true, id }],
          }));
        });
  
        const find = Array.from(offcanvasRef.current.children).find(
          (value) => value.getAttribute('data-oid') === id,
        );
        if (!find) {
          throw new Error('An error occurred with the component');
        }
  
        const instance = context.bootstrap.Offcanvas.getOrCreateInstance(find);
        instanceRefs.current.set(id, instance);
        instance.show();
        return id;
      },
      [context.bootstrap],
    );
  
    const hide = useCallback((id: string) => {
      setCustomOffcanvasProps((prevState) => ({
        ...prevState,
        items: prevState.items.map((item) =>
          item.id === id ? { ...item, isShow: false } : item,
        ),
      }));
  
      instanceRefs.current.get(id)?.hide();
    }, []);
  
    return (
      <OffcanvasContext.Provider
        value={{
          isLoadingOffcanvasShowing,
          show,
          hide,
        }}
      >
        {children}
        {isInit && (
          <Offcanvas
            hide={hide}
            offcanvasRef={offcanvasRef}
            instanceRefs={instanceRefs}
            customOffcanvasProps={customOffcanvasProps}
            setCustomOffcanvasProps={setCustomOffcanvasProps}
            setIsLoadingOffcanvasShowing={setIsLoadingOffcanvasShowing}
          />
        )}
      </OffcanvasContext.Provider>
    );
  }
  
  const Offcanvas = ({
    hide,
    offcanvasRef,
    instanceRefs,
    customOffcanvasProps,
    setCustomOffcanvasProps,
    setIsLoadingOffcanvasShowing,
  }: {
    hide: (id: string) => void;
    offcanvasRef: RefObject<HTMLDivElement>;
    instanceRefs: MutableRefObject<Map<string, Bootstrap.Offcanvas>>;
    customOffcanvasProps: IOffcanvasPropsContainer;
    setCustomOffcanvasProps: Dispatch<SetStateAction<IOffcanvasPropsContainer>>;
    setIsLoadingOffcanvasShowing: Dispatch<SetStateAction<boolean>>;
  }) => {
    const lastHiddenId = useRef<string>();
  
    useEffect(() => {
      const handleOffcanvasShown = async (id: string) => {
        setIsLoadingOffcanvasShowing(false);
        await customOffcanvasProps.items
          .find((item) => item.id === id)
          ?.onShown?.();
      };
      const handleOffcanvasHidden = async (id: string) => {
        if (lastHiddenId.current === id) {
          return;
        }
  
        lastHiddenId.current = id;
        setCustomOffcanvasProps((prevState) => {
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
        await customOffcanvasProps.items
          .find((item) => item.id === id)
          ?.onHidden?.();
        instanceRefs.current.get(id)?.dispose();
        instanceRefs.current.delete(id);
      };
  
      const current = offcanvasRef.current;
      if (current) {
        customOffcanvasProps.items.forEach((item) => {
          const element = Array.from(current.children).find(
            (value) => value.getAttribute('data-oid') === item.id,
          );
          if (element) {
            element.addEventListener('shown.bs.offcanvas', () =>
              handleOffcanvasShown(item.id),
            );
            element.addEventListener('hidden.bs.offcanvas', () =>
              handleOffcanvasHidden(item.id),
            );
          }
        });
      }
  
      return () => {
        if (current) {
          customOffcanvasProps.items.forEach((item) => {
            const element = Array.from(current.children).find(
              (value) => value.id === item.id,
            );
            if (element) {
              element.removeEventListener('shown.bs.offcanvas', () =>
                handleOffcanvasShown(item.id),
              );
              element.removeEventListener('hidden.bs.offcanvas', () =>
                handleOffcanvasHidden(item.id),
              );
            }
          });
        }
      };
    }, [
      customOffcanvasProps.items,
      instanceRefs,
      offcanvasRef,
      setCustomOffcanvasProps,
      setIsLoadingOffcanvasShowing,
    ]);
  
    return createPortal(
      <div ref={offcanvasRef}>
        {customOffcanvasProps.items.map((item) => {
          const {
            title,
            header,
            headerTitle,
            content = '...',
            customContent,
            isShowHeader = true,
            isShowHeaderTitle = true,
            isShowContent = true,
            isStatic = false,
            bodyScroll = false,
            backdrop = true,
            offcanvasClass,
            offcanvasBodyClass,
            offcanvasStyle,
            scroll = false,
            keyboard = true,
            start,
            end,
            top,
            bottom,
            isShow,
            id,
          } = item;
  
          return (
            <div
              key={item.id}
              className={classNames('offcanvas', offcanvasClass, {
                'offcanvas-start': start
                  ? start
                  : !start && !end && !top && !bottom,
                'offcanvas-end': end,
                'offcanvas-top': top,
                'offcanvas-bottom': bottom,
              })}
              aria-labelledby={title ? title : 'offcanvas'}
              aria-hidden={isShow ? 'false' : 'true'}
              data-oid={id}
              data-bs-backdrop={isStatic ? 'static' : backdrop ? 'true' : 'false'}
              data-bs-scroll={bodyScroll ? 'true' : 'false'}
              data-bs-config={JSON.stringify({
                scroll: scroll ?? false,
                keyboard: keyboard ?? true,
                backdrop: backdrop ?? true,
              })}
              style={{ ...offcanvasStyle }}
            >
              {customContent ? (
                <div className={classNames('offcanvas-body', offcanvasBodyClass)}>
                  {customContent}
                </div>
              ) : (
                <>
                  {isShowHeader &&
                    (header ? (
                      header
                    ) : (
                      <div className="offcanvas-header">
                        {isShowHeaderTitle &&
                          (headerTitle ? (
                            headerTitle
                          ) : (
                            <h5 className="offcanvas-title">{title || '...'}</h5>
                          ))}
  
                        <button
                          onClick={hide.bind(this, id)}
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                        ></button>
                      </div>
                    ))}
  
                  {isShowContent && (
                    <div
                      className={classNames('offcanvas-body', offcanvasBodyClass)}
                    >
                      {content}
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