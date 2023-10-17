'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next-intl/client';
import { useLocale, useTranslations } from 'use-intl';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    type ChangeEvent,
    type FormEvent,
    useCallback,
    useEffect,
    useState,
    useTransition,
    useRef,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TMetadata } from '@/types';
import useToast from '@/hooks/useToast';
import Avatar from '@/app/[locale]/login/avatar';
import LoginNav from '@/app/[locale]/login/loginNav';
import SearchBar from '@/app/[locale]/search/searchBar';
import { IData, ISiteConfig, ISiteInfo } from '@/interfaces';
import { useRecoilValue } from "recoil";
import { userDataContext } from "@/store/userData";

import { useRecoilState } from "recoil";
import { currentArticleDataContext } from '@/store/articleData';

export const NavbarPage = ({
    metadata,
    fixedTop = true,
}: {
    metadata: TMetadata;
    fixedTop?: boolean;
}) => {
    return <Navbar metadata={metadata} fixedTop={fixedTop} />;
};

const Navbar = ({
  metadata,
  fixedTop = true,
}: {
  metadata: TMetadata;
  fixedTop?: boolean;
}) => {
  const userData = useRecoilValue(userDataContext);

  const t = useTranslations('Navbar');

  useEffect(() => {
    let lastScrollTop = 0;
    let autoEle = document.querySelector('.autohide');
    const scrollSwitch = () => {
      let scrollY = document.documentElement.scrollTop || document.body.scrollTop;
      if (autoEle) {
        // 向上
        if(scrollY < lastScrollTop) {
          autoEle.classList.remove('scrolledDown');
          autoEle.classList.add('scrolledUp');
        }
        // 向下
        if (scrollY > 350 && scrollY > lastScrollTop) {
          autoEle.classList.remove('scrolledUp');
          autoEle.classList.add('scrolledDown');
        }
        lastScrollTop = scrollY;
      }
    };
    window.addEventListener("scroll", scrollSwitch);
    return () => {
      window.removeEventListener("scroll", scrollSwitch);
    };
  }, []);
  
  const [siteInfo, setSiteInfo] = useState<ISiteConfig>();
  const navRef = useRef(null);
  const searchRef = useRef()
  
  // useQuery(["siteInfo"], getSiteConfig, {
  //   onSuccess: ({ data }: { data: IData<any>}) => {
  //     setSiteInfo(data.data);
  //   },
  //   cacheTime: Infinity,
  //   staleTime: Infinity,
  // });
  // const queryClient = useQueryClient();
  // function test() {
  //   let data = queryClient.getQueryData(["siteInfo"])

  // }

  function clickCallback(event: React.MouseEvent<HTMLButtonElement>) {
    // @ts-ignore
    if (navRef.current.contains(event.target)) {
      return;
    }
    // @ts-ignore
    searchRef.current.setShowSearchLayer(false);
  }

  useEffect(() => {
    // @ts-ignore
    document.addEventListener("click", clickCallback, false);
    return () => {
      // @ts-ignore
      document.removeEventListener("click", clickCallback, false);
    };

  }, []);

  return (
    <>
      <style jsx>{`
        .scrolledDown{
          transform:translateY(-100%); transition: all 0.3s ease-in-out;
        }
        .scrolledUp{
          transform:translateY(0); transition: all 0.3s ease-in-out;
        }
      `}</style>
    
      <nav className={classNames('autohide navbar navbar-expand nav-bg', (fixedTop && 'fixed-top'))} style={{maxHeight:"60px"}} ref={navRef}>
        <div className="container-fluid">
          {/* <Logo metadata={metadata} /> */}
          <div className="d-flex flex-grow-1 align-items-center gap-4 justify-content-between d-none d-md-flex">
            <ul className="navbar-nav">
              <LinkNavItem href="#" name={t('homePage')} />
              <MessageNavItem metadata={metadata} />
              <FollowMessageNavItem
                metadata={metadata}
              />
              <SearchBar ref={searchRef}/>
            </ul>

            <div className="d-flex align-items-center justify-content-center justify-content-between me-3" style={{width:"120px"}}>
              { userData==null ? (<LoginNav />) : (<Avatar />)}
              <ColorModeItem />
              <TranslateItem />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};


const Logo = ({ metadata }: { metadata: TMetadata }) => {
    const env = metadata.env;

    return (
      <Link href="/" className="navbar-brand">
        <Image
          src="/images/logo.svg"
          alt={`${env.APP_NAME} - ${env.APP_URL_HOST}`}
          width={48}
          height={48}
          placeholder="blur"
          blurDataURL={env.APP_BLUR_DATA_URL}
          title={`${env.APP_NAME} - ${env.APP_URL_HOST}`}
        />
      </Link>
    );
};


export const TranslateItem = () => {
    const router = useRouter();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
  
    function onClickTranslate(value: string) {
      startTransition(() => {
        router.replace(`/${value}${pathname}`);
      });
    }
  
    return (
      <>
        <div className="dropdown">
          <a href="#!" role="button" className="nav-link" id="dropdownTranslateLink" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="iconfont icon-zhongyingwenqiehuan-xianshizhongyingwen fs-3 text-black-50"></i>
          </a>
          <ul className="dropdown-menu" aria-labelledby="dropdownTranslateLink" style={{ left: "auto", right: 0 }}>
            <li>
              <a href="#!" onClick={onClickTranslate.bind(this, 'en')} className={classNames('dropdown-item d-flex align-items-center', {
                active: locale === 'en',
              })}>
                {isPending && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                English{locale === 'en' && <i className="bi bi-check2 ms-2"></i>}
              </a>
            </li>
            <li>
              <a href="#!" onClick={onClickTranslate.bind(this, 'zh')} className={classNames('dropdown-item d-flex align-items-center', {
                active: locale === 'zh',
              })}>
                {isPending && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
              简体中文{locale === 'zh' && <i className="bi bi-check2 ms-2"></i>}
              </a>
            </li>
          </ul>
        </div>
      </>
    );
};

export const ColorModeItem = ({
    hidden,
    name,
    isShowDropdownToggle = false,
    aPy0 = false,
    callback,
}: {
    name?: string;
    hidden?: boolean;
    isShowDropdownToggle?: boolean;
    aPy0?: boolean;
    callback?: (theme: 'auto' | 'dark' | 'light') => void;
  }) => {

    const [colorMode, setColorMode] = useState('auto');
    const t = useTranslations('Navbar');

    const getStoredTheme = useCallback(() => {
        return localStorage.getItem('theme');
    }, []);

    const setStoredTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
    }, []);

    const getPreferredTheme = useCallback(() => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }

        return matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }, [getStoredTheme]);

    const setTheme = useCallback((theme: string) => {
        const qName = 'data-bs-theme';
        if (
            theme === 'auto' &&
            matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            document.documentElement.setAttribute(qName, 'dark');
        } else {
            document.documentElement.setAttribute(qName, theme);
        }
        setColorMode(theme);
        if (typeof callback === 'function') {
            callback(theme as 'auto' | 'dark' | 'light');
        }
    }, []);

    const onClickColorMode = useCallback(
        (theme?: string) => {
          const preferredTheme = theme ? theme : getPreferredTheme();
          setStoredTheme(preferredTheme);
          setTheme(preferredTheme);
        },
        [getPreferredTheme, setStoredTheme, setTheme],
    );
    
    useEffect(() => {
        function handleChange() {
          const storedTheme = getStoredTheme();
          if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
          }
        }
    
        if (typeof localStorage !== 'undefined') {
          onClickColorMode();
          matchMedia('(prefers-color-scheme: dark)').addEventListener(
            'change',
            handleChange,
          );
        }
    
        return () => {
          matchMedia('(prefers-color-scheme: dark)').removeEventListener(
            'change',
            handleChange,
          );
        };
    }, [getPreferredTheme, getStoredTheme, onClickColorMode, setTheme]);


    return (
        <>
          {!hidden && (
            <div className="dropdown">
              <a href="#!" className="nav-link" role="button" id="dropdownLoginLink" data-bs-toggle="dropdown" aria-expanded="false">
                  {colorMode === 'light' &&
                    (name ? name : <i className="iconfont icon-a-15Bliangdu- fs-3 text-black-50"></i>)}
                  {colorMode === 'dark' &&
                    (name ? name : <i className="iconfont icon-a-15Bliangdu- fs-3 text-black-50"></i>)}
                  {colorMode === 'auto' &&
                    (name ? name : <i className="iconfont icon-a-15Bliangdu- fs-3 text-black-50"></i>)}
              </a>
              <ul className="dropdown-menu" aria-labelledby="dropdownLoginLink" style={{left:"auto", right: 0}}>
                  <li>
                    <a href="#" onClick={onClickColorMode.bind(this, 'light')} 
                      className={classNames('dropdown-item d-flex align-items-center', {active: colorMode === 'dark',},)}>
                      <i className="bi bi-brightness-high-fill me-2"></i>
                      {t('light')}
                      {colorMode === 'light' && <i className="bi bi-check2 ms-2"></i>}
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={onClickColorMode.bind(this, 'dark')}
                      className={classNames('dropdown-item d-flex align-items-center', {active: colorMode === 'dark',},)}>
                      <i className="bi bi-moon-stars-fill me-2"></i>
                      {t('dark')}
                      {colorMode === 'dark' && <i className="bi bi-check2 ms-2"></i>}
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={onClickColorMode.bind(this, 'auto')}
                      className={classNames('dropdown-item d-flex align-items-center',{active: colorMode === 'auto',},)}>
                      <i className="bi bi-circle-half me-2"></i>
                      {t('auto')}
                      {colorMode === 'auto' && <i className="bi bi-check2 ms-2"></i>}
                    </a>
                  </li>
              </ul>
          </div>
          )}
        </>
    );
};


const LinkNavItem = ({ href, name }: { href: string; name: string }) => {
    return (
      <li className="nav-item">
        <Link href={href} className="nav-link">
          {name}
        </Link>
      </li>
    );
};

const FollowMessageNavItem = ({
    metadata
  }: {
    metadata: TMetadata;
  }) => {
    const t = useTranslations('Navbar');
  
    return (
      <>
          <li className="nav-item">
            <Link
              href="/follow"
              className="nav-link cursor-pointer d-flex align-items-center"
            >
              <span className="position-relative">
                {t('message')}
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">
                    222
                    </span>
                </span>
              </span>
            </Link>
          </li>
      </>
    );
  };
  
const MessageNavItem = ({
    metadata,
}: {
    metadata: TMetadata;
}) => {
    const t = useTranslations('Navbar');
    const [unreadCount, setUnreadCount] = useState(0);
  
    return (
      <>

        <li className="nav-item">
        <Link
            href="/message"
            className="nav-link cursor-pointer d-flex align-items-center"
        >
            <span className="position-relative">
            {t('message')}
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">22</span>
            </span>
            </span>
        </Link>
        </li>

      </>
    );
};

  