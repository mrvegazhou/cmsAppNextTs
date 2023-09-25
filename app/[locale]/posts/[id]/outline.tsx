import { useCallback, useEffect, useState } from 'react';
import AlertLoad from '@/app/[locale]/alert/load';
import useToast from '@/hooks/useToast';
import XRegExp from 'xregexp';
import sanitizeHtml from 'sanitize-html';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';

type OutlineItemType = {
  id: string;
  level: number;
  name: string;
  children: OutlineItemType[];
};

export default function Outline({
  content,
  px0 = true,
  mb4 = true,
}: {
  content: string;
  px0?: boolean;
  mb4?: boolean;
}) {
  const { show } = useToast();
  const [list, setList] = useState<OutlineItemType[]>([]);
  const [isClose, setIsClose] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('PostEditPage');
  const handleOutlineText = useCallback((text: string) => {
    const arr: OutlineItemType[] = [];

    XRegExp.forEach(
      text,
      XRegExp(/<h(\d)\b[^>]*>(.*?)<\/h\d>/gm),
      (matches) => {
        const level = parseInt(matches[1]);
        const name = sanitizeHtml(matches[2], {
          allowedTags: [],
        })
          .replace(/\s+/g, '')
          .replace(/[.、，,:/]/g, '_')
          .trim();

        let id = `post-name-${level}-${name}`;
        let num = 0;
        while (arr.find((item) => item && item.id === id)) {
          num = num + 1;
          id = `post-name-${level}-${name}-${num}`;
        }

        const value: OutlineItemType = {
          id,
          level,
          name,
          children: [],
        };

        const find = arr.find((item) => item.level === level);
        if (find) {
          find.children.push(value);
        } else {
          arr.push(value);
        }
      },
    );

    if (arr.length === 1 && arr[0].children.length > 0) {
      arr.push(...arr[0].children);
      arr[0].children = [];
    }

    setList(arr);
  }, []);

  useEffect(() => {
    if (content) {
      try {
        setLoading(true);
        handleOutlineText(content);
      } catch (e) {
        show({
          type: 'DANGER',
          message: e,
        });
      } finally {
        setLoading(false);
      }
    }
  }, [content, handleOutlineText, show]);

  const onClickCloseOutline = useCallback(() => {
    setIsClose(true);
  }, []);

  const onPointer = useCallback(() => {
    setIsClose(false);
  }, []);

  return (
    <>
      {list.length > 0 && (
        <>
          <div
            onClick={onPointer}
            className={classNames(
              'position-absolute end-0 mx-3 cursor-pointer user-select-none animate__animated animate__rotateIn',
              {
                'd-none': !isClose,
              },
            )}
            style={{
              top: '1.75rem',
            }}
          >
            <i
              aria-label={t('clickToExpandOutline')}
              className="bi bi-aspect-ratio"
              style={{ fontSize: '1.35rem' }}
            ></i>
          </div>

          <div
            className={classNames(
              'card border-0 animate__animated animate__zoomIn',
              {
                'd-none': isClose,
                'mb-4': mb4,
              },
            )}
          >
            <div
              className={classNames('card-body', {
                'px-0': px0,
              })}
            >
              <div className="vstack gap-4">
                <div className="hstack gap-4 align-items-center justify-content-end user-select-none">
                  <i
                    onClick={onClickCloseOutline}
                    aria-label="Close"
                    className="bi bi-x-lg d-flex cursor-pointer"
                    style={{ fontSize: '1.35rem' }}
                  ></i>
                </div>
                <div className="overflow-y-auto">
                  <ol className="list-group list-group-numbered list-group-flush">
                    {list.map((item) => {
                      return (
                        <li
                          key={item.id}
                          className="list-group-item list-group-item-light list-group-item-action text-start d-inline-flex"
                          aria-current="true"
                        >
                          <Link
                            className="text-reset text-decoration-none flex-grow-1"
                            href={{
                              pathname,
                              hash: item.name,
                            }}
                          >
                            {item.name}
                          </Link>

                          {item.children.length > 0 && (
                            <ol className="mt-2 list-group list-group-numbered list-group-flush">
                              {item.children.map((value) => {
                                return (
                                  <li
                                    key={value.id}
                                    className="list-group-item list-group-item-light list-group-item-action text-start d-inline-flex"
                                    aria-current="true"
                                  >
                                    <Link
                                      className="text-reset text-decoration-none flex-grow-1"
                                      href={{
                                        pathname,
                                        hash: value.name,
                                      }}
                                    >
                                      {value.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ol>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isLoading && (
        <div className="card border-0">
          <div className="card-body">
            <AlertLoad />
          </div>
        </div>
      )}
    </>
  );
}
