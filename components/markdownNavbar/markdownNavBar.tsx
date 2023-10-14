"use client"
import React, { useState, useEffect, useRef, RefObject } from "react";
import styles from './markdownNavBar.module.scss';
import { throttle } from "lodash"
import useSyncState from "@/hooks/useState";


interface MarkdownNavBarProps {
    source: string;
    ordered?: boolean;
    headingTopOffset?: number;
    updateHashAuto?: boolean;
    hashMode?: boolean;
    declarative?: boolean;
    className?: string;
    behavior?: ScrollBehavior;
    navContent: RefObject<HTMLElement>;
    onNavItemClick?: (a:any, b:any, c:any) => {};
    onHashChange?: (a:any, b:any) => {};
}

interface NavDataProps {
    index: number;
    level: number;
    text: string;
    listNo?: string;
}

const MarkdownNavBarComp = React.forwardRef<HTMLDivElement, MarkdownNavBarProps>((props, ref) => {
    let {
        source = "",
        ordered = false,
        headingTopOffset = 0,
        updateHashAuto = false,
        hashMode = false,
        declarative = false,
        className = "",
        behavior = "auto",
        navContent,
        onNavItemClick = (a:any, b:any, c:any) => {},
        onHashChange = (a:any, b:any) => {},
    } = props;

    let addTargetTimeout: NodeJS.Timeout | null = null;
    let updateHashTimeout: NodeJS.Timeout | null = null;
    let scrollTimeout: NodeJS.Timeout | null = null;
    let scrollEventLock: boolean;

    const [currentListNo, setCurrentListNo] = useState<string | undefined>("");

    const [navStructure, setNavStructure] = useSyncState([]);

    const trimArrZero = (arr: any[]) => {
        let start;
        let end;
        for (start = 0; start < arr.length; start += 1) {
          if (arr[start]) {
            break;
          }
        }
        for (end = arr.length - 1; end >= 0; end -= 1) {
          if (arr[end]) {
            break;
          }
        }
        return arr.slice(start, end + 1);
    }

    const getNavStructure = (source: string) => {
      const contentWithoutCode = source
            .replace(/^[^#]+\n/g, '')
            .replace(/(?:[^\n#]+)#+\s([^#\n]+)\n*/g, '') // 匹配行内出现 # 号的情况
            .replace(/^#\s[^#\n]*\n+/, '')
            .replace(/```[^`\n]*\n+[^```]+```\n+/g, '')
            .replace(/`([^`\n]+)`/g, '$1')
            .replace(/\*\*?([^*\n]+)\*\*?/g, '$1')
            .replace(/__?([^_\n]+)__?/g, '$1')
            .trim();
        const pattOfTitle = /#+\s([^#\n]+)\n*/g;
        const matchResult = contentWithoutCode.match(pattOfTitle);
        if (!matchResult) {
            return [];
        }
        const navData: NavDataProps[] = matchResult.map((r, i) => {
            return {
                index: i,
                level: r.match(/^#+/g)![0].length,
                text: r.replace(pattOfTitle, "$1"),
            }
        });
        let maxLevel = 0;
        navData.forEach((t) => {
            if (t.level > maxLevel) {
                maxLevel = t.level;
            }
        });
        const matchStack: any[] = [];
        for (let i = 0; i < navData.length; i++) {
            const t = navData[i];
            const { level } = t;
            while ( matchStack.length && matchStack[matchStack.length - 1].level > level ) {
                matchStack.pop();
            }
            if (matchStack.length === 0) {
                const arr = new Array(maxLevel).fill(0);
                arr[level - 1] += 1;
                matchStack.push({
                  level,
                  arr,
                });
                t.listNo = trimArrZero(arr).join(".");
            } else {
                const { arr } = matchStack[matchStack.length - 1];
                const newArr = arr.slice();
                newArr[level - 1] += 1;
                matchStack.push({
                    level,
                    arr: newArr,
                });
                t.listNo = trimArrZero(newArr).join(".");
            }
        }
        return navData;
    };

    const safeScrollTo = (element: Element | Window, top: number, left: number = 0) => {
        element.scrollTo({ behavior, top, left });
    };


    const navRef = useRef<NavDataProps[]>([])
    useEffect(() => {//组件每次挂载完，countRef.current会存储上最新的值
      navRef.current = navStructure
    }, [navStructure])

    const refreshNav = (source: string) => {
        if (addTargetTimeout) {
            clearTimeout(addTargetTimeout);
        }
        
        navRef.current = getNavStructure(source);
        
        setNavStructure(navRef.current, (data: any) => {
              addTargetTimeout = setTimeout(() => {
                initHeadingsId();
                scrollEventLock = false;
                if (data.length) {
                    const { listNo } = data[0];
                    setCurrentListNo(listNo);
                    document.addEventListener("scroll", winScroll, true);
                    window.addEventListener("hashchange", winHashChange, false);
                }
              }, 0);
        });
    };

    const winHashChange = () => {
        scrollToTarget(currentListNo);
    };

    const winScroll = throttle(() => {
        if (scrollEventLock) return;
        const scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
        const newHeadingList = getHeadingList().map((h: any) => ({
          ...h,
          distanceToTop: Math.abs(
            scrollTop + headingTopOffset - h.offsetTop
          ),
        }));
        const minDistance = Math.min(...newHeadingList.map((h: any) => h.distanceToTop));
        const curHeading = newHeadingList.find(
          (h: any) => h.distanceToTop === minDistance
        );
    
        if (!curHeading) return;
    
        if (updateHashAuto && hashMode) {
          // Hash changing callback
          if (curHeading.dataId !== getCurrentHashValue()) {
            onHashChange(curHeading.dataId, getCurrentHashValue());
          }
    
          updateHash(curHeading.dataId);
        }
        setCurrentListNo(curHeading.listNo);
    }, 300);

    const getHeadingList = () => {
        const headingList: any = [];
        let ele = getEle();
        navRef.current.forEach((t: any) => {
          const headings = ele.querySelectorAll(`h${t.level}`);
          const curHeading = Array.prototype.slice
            .apply(headings)
            .find(
              (h) =>
                h.innerText.trim() === t.text.trim() &&
                !headingList.find((x: any) => x.offsetTop === h.offsetTop)
            );
          if (curHeading) {
            headingList.push({
              dataId: declarative ? t.text : `heading-${t.index}`,
              listNo: t.listNo,
              offsetTop: curHeading.offsetTop,
            });
          }
        });
    
        return headingList;
      }
    
    const getCurrentHashValue = () =>
        decodeURIComponent(window.location.hash.replace(/^#/, ""));

    const updateHash = (value: string) => {
        if (updateHashTimeout) {
          clearTimeout(updateHashTimeout);
        }
    
        updateHashTimeout = setTimeout(() => {
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}${window.location.search}#${value}`
          );
        }, 0);
    }

    const initHeadingsId = () => {
        //@ts-ignore
        const headingId = decodeURIComponent(declarative ? window.location.hash.replace(/^#/, "").trim() : (window.location.hash.match(/heading-\d+/g) || [])[0]);
        let ele = getEle();
        navRef.current.forEach((t: any) => {
            const headings = ele.querySelectorAll(`h${t.level}`);
            const curHeading = Array.prototype.slice
                                .apply(headings)
                                .find(
                                    (h) =>
                                        h.innerText.trim() === t.text.trim() &&
                                        (!h.dataset || !h.dataset.id)
                                    );
              if (curHeading) {
                curHeading.dataset.id = declarative ? `${t.listNo}-${t.text}` : `heading-${t.index}`;
              }
              if (headingId && headingId === curHeading.dataset.id) {
                  setCurrentListNo(t.listNo);
              }
        });
    };

    const getEle = () => {
      let ele: Document | HTMLElement;
      if (navContent.current) {
        ele = navContent.current;
      } else {
        ele = document;
      }
      return ele;
    };

    const scrollToTarget = (dataId: string | undefined) => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          let ele = getEle();
          const target = ele.querySelector(`[data-id="${dataId}"]`);
          //@ts-ignore
          if (target && typeof target.offsetTop === "number") {
            safeScrollTo(
              window,
              //@ts-ignore
              target.offsetTop - headingTopOffset
            );
          }
        }, 0);
    };

    useEffect(() => {
        scrollEventLock = true;
        refreshNav(source);
        setCurrentListNo("");

        let ele = getEle();
        let headings = ele.querySelectorAll("h1, h2, h3, h4, h5, h6");

        Array.prototype.slice.apply(headings).forEach((h) => {
            h.dataset.id = "";
        });
        
        return () => {
            if (addTargetTimeout) {
                clearTimeout(addTargetTimeout);
            }
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            document.removeEventListener("scroll", winScroll, true);
            window.removeEventListener("hashchange", winHashChange, false);
        };

    }, [source]);

    const getBlocks = () => {
        return navRef.current.map((t: any) => {
            const cls = `${styles["title-anchor"]} ${
                styles[`title-level${t.level}`]
            }  ${currentListNo === t.listNo ? styles.active : ""}`;

            return (
                <div
                  className={cls}
                  onClick={(evt) => {
                    const currentHash = declarative
                      ? `${t.listNo}-${t.text}` // 加入listNo确保hash唯一ZZ
                      : `heading-${t.index}`;
        
                    // Avoid execution the callback `onHashChange` when clicking current nav item
                    if (t.listNo !== currentListNo) {
                      // Hash changing callback
                      onHashChange(currentHash, getCurrentHashValue());
                    }
        
                    // Nav item clicking callback
                    onNavItemClick(evt, evt.target, currentHash);
        
                    if (hashMode) {
                      updateHash(currentHash);
                    }
                    scrollToTarget(currentHash);
                    setCurrentListNo(t.listNo);
                  }}
                  key={`title_anchor_${Math.random().toString(36).substring(2)}`}
                >
                  {ordered ? <small>{t.listNo}</small> : null}
                  {t.text}
                </div>
            );
        });
    };

    return (
        <div className={`${styles["markdown-navigation"]} ${className}`}>
            {getBlocks()}
        </div>
    );
});

MarkdownNavBarComp.displayName = "MarkdownNavBarComp";
export default MarkdownNavBarComp;