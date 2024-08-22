'use client';
import React, { useState, useEffect, useRef } from "react";
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useAtomValue } from 'jotai'
import { userDataAtom } from "@/store/userData";
// import useToast from '@/hooks/useToast';
import SimpleEditor from "@/components/richEditor2/simpleEditor/App";
import PopoverComp from "@/components/popover/popover";
import Menu from "@/components/menu/Menu";
import type { IArticleComment } from "@/interfaces";
import styles from "./index.module.scss";

interface propsType {
    comments: IArticleComment[];
}
const ArticleComments = (props: propsType) => {
    let userData = useAtomValue(userDataAtom);
    const t = useTranslations('Navbar');
    // const { show } = useToast();

    useEffect(() => {
    }, []);

    const content = (
        <Menu>
            <Menu.Item iconClass="icon-error" iconsize="15px" text={(<span>举报</span>)} />
            <Menu.Item iconClass="icon-copy" iconsize="15px" text={(<span>复制</span>)} />
        </Menu>
    );

    const simpleEditorsRefs = useRef(new Map<string, React.RefObject<typeof SimpleEditor>>());

    const addEditorRef = (index: string, ref: React.RefObject<typeof SimpleEditor> | null) => {
        if (ref) {
          simpleEditorsRefs.current.set(index, ref);
        } else {
          simpleEditorsRefs.current.delete(index);
        }
    };

    const showEditorFn = (id: string) => {
        const eleRef = simpleEditorsRefs.current.get(id);
        if (eleRef && 'changeCls' in eleRef && 'getCls' in eleRef) {
            //@ts-ignore
            if (eleRef.getCls()=='hidden') {
                //@ts-ignore
                eleRef.changeCls('');
            } else {
                //@ts-ignore
                eleRef.changeCls('hidden');
            }
        }
    };

    return (
        <>
            <div className={styles.commentContainer}>
                <ArticleCommentEditor />
                <div className={styles.header}>
                    <div className={styles.title}>100条评论</div>
                    <div className={styles.null}></div>
                    <div className={styles.sort}>
                        <div className={styles.sortDefault}>默认</div>
                        <div className={styles.sortNew}>最新</div>
                    </div>
                </div>
                <div className={styles.commentMain}>
                    <div className={styles.commentList}>
                        <div className={styles.commentContent}>
                            <div className={styles.commentUserHeader}>
                                <a href="http://www.baidu.com" target="_blank">
                                    <img className={classNames(styles.headerImg, 'rounded-circle shadow-4')} src="https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63" alt="老大哥瞅着啥也不敢说" />
                                </a>
                            </div>
                            <div className={styles.commentUserContent}>
                                <div className={styles.commentUserName}>
                                    <div className={styles.userName}>
                                        <a href="https://www.zhihu.com/people/3e15422820160c2ec237ce48de34062c" target="_blank">
                                        老大哥瞅着啥也不敢说
                                        </a>
                                    </div>
                                    <div className={styles.userMiddle}></div>
                                    <PopoverComp trigger="click" placement="bottom" content={content} zIndex='9999'>
                                        <i className="iconfont icon-more"></i>
                                    </PopoverComp>
                                </div>
                                <div className={styles.userComment}>
                                ChatGPT大火之前，也没听说国内有哪家干这个。ChatGPT一火，就都能干了。这里的道理，一想可知。
                                </div>
                                <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                    <div className={styles.dateAddr}>
                                        <span className="date">07-05</span>
                                        <span></span>
                                        <span className="addr">安徽</span>
                                        <span></span>
                                        <span className="hot">热评</span>
                                    </div>
                                    <div className={styles.replyLike}>
                                        <button type="button" className={styles.btn} onClick={() => {showEditorFn('1'); }}>
                                            <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                <i className="iconfont icon-comment me-1" />
                                            </span>回复
                                        </button>
                                        <button type="button" className={styles.btn}>
                                            <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                <i className="iconfont icon-like-o me-1" />
                                            </span>1289
                                        </button>
                                    </div>
                                </div>
                                <div className={classNames(styles.commentEditor)}>
                                    <SimpleEditor ref={(ref:any) => addEditorRef('1', ref)} cls="hidden"/>
                                </div>
                            </div>
                        </div>
                        <div className={classNames(styles.commentContentReply)}>
                            <div className={classNames(styles.commentContent, styles.indent)}>
                                <div className={styles.commentUserHeader}>
                                    <a href="" target="_blank" className="">
                                        <img className={classNames(styles.headerImg, "rounded-circle shadow-4")} src="https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63" alt="老大哥瞅着啥也不敢说" loading="lazy" />
                                    </a>
                                </div>
                                <div className={styles.commentUserContent}>
                                    <div className={styles.commentUserName}>
                                        <div className={styles.userName}>
                                            <a href="https://www.zhihu.com/people/3e15422820160c2ec237ce48de34062c" target="_blank">
                                            老大哥瞅着啥也不敢说
                                            </a>
                                        </div>
                                        <div className={styles.userMiddle}></div>
                                        <i className="iconfont icon-more"></i>
                                    </div>
                                    <div className={styles.userComment}>
                                    ChatGPT大火之前，也没听说国内有哪家干这个。ChatGPT一火，就都能干了。这里的道理，一想可知。
                                    </div>
                                    <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                        <div className={styles.dateAddr}>
                                            <span className="date">07-05</span>
                                            <span></span>
                                            <span className="addr">安徽</span>
                                            <span></span>
                                            <span className="hot">热评</span>
                                        </div>
                                        <div className={styles.replyLike}>
                                            <button type="button" className={styles.btn}>
                                                <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                    <i className="iconfont icon-like-o me-1" />
                                                </span>回复
                                            </button>
                                            <button type="button" className={styles.btn}>
                                                <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                    <i className="iconfont icon-comment me-1" />
                                                </span>1289
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={classNames(styles.commentContent, styles.indent)}>
                                <div className={styles.commentUserHeader}>
                                    <a href="" target="_blank" className="">
                                        <img className={classNames(styles.headerImg, "rounded-circle shadow-4")} src="https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63" alt="老大哥瞅着啥也不敢说" loading="lazy" />
                                    </a>
                                </div>
                                <div className={styles.commentUserContent}>
                                    <div className={styles.commentUserName}>
                                        <div className={styles.userName}>
                                            <a href="https://www.zhihu.com/people/3e15422820160c2ec237ce48de34062c" target="_blank">
                                            老大哥瞅着啥也不敢说
                                            </a>
                                            <i className="iconfont icon-youjiantou" />
                                            <a className={styles.replyUserName} href="https://www.zhihu.com/people/3e15422820160c2ec237ce48de34062c">老大哥瞅着啥也不敢说</a>
                                        </div>
                                        <div className={styles.userMiddle}></div>
                                        <i className="iconfont icon-more"></i>
                                    </div>
                                    <div className={styles.userComment}>
                                    ChatGPT大火之前，也没听说国内有哪家干这个。ChatGPT一火，就都能干了。这里的道理，一想可知。
                                    </div>
                                    <div className={classNames(styles.dateAddrReply, 'text-black-50')}>
                                        <div className={styles.dateAddr}>
                                            <span className="date">07-05</span>
                                            <span></span>
                                            <span className="addr">安徽</span>
                                            <span></span>
                                            <span className="hot">热评</span>
                                        </div>
                                        <div className={styles.replyLike}>
                                            <button type="button" className={styles.btn}>
                                                <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                    <i className="iconfont icon-like-o me-1" />
                                                </span>回复
                                            </button>
                                            <button type="button" className={styles.btn}>
                                                <span style={{display: 'inline-flex', alignItems: 'center'}}>
                                                    <i className="iconfont icon-comment me-1" />
                                                </span>1289
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{marginBottom:"500px"}}></div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default ArticleComments;

const ArticleCommentEditor = () => {
    const simpleEditorRef = useRef(null);
    return (
        <div className={styles.commentUserEditor}>
            <img className={styles.avatar} src="https://pica.zhimg.com/v2-5cd72e004ec62e6052ebccf7836f26f5_l.jpg?source=32738c0c" />
            <div className="ms-2 w-100">
                <SimpleEditor ref={simpleEditorRef}/>
            </div>
        </div>
    );
};