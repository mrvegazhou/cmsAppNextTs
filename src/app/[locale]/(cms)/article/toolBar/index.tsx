'use client';
import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslations } from 'next-intl';
import dynamic from "next/dynamic";
import Drawer from "@/components/drawer";
const Likes = dynamic(() => import("./like"), {
  ssr: false,
});
const Collection = dynamic(() => import("./collection"), {
  ssr: false,
});
const Comment = dynamic(() => import("./comment"), {
  ssr: false,
});
const Share = dynamic(() => import("./share"), {
  ssr: false,
});
const Report = dynamic(() => import("./report"), {
  ssr: false,
});
const ArticleComments = dynamic(() => import("../comments/index"), {
  ssr: false,
});

const DivCom = styled.div`
    left:max(0px, calc(50vw - 680px));
    position:fixed;
    top:8rem;
    width:70px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items: center;
`

const ToolBar = () => {
  const t = useTranslations('ArticleIdPage');
  const [commentVisible, setCommentVisible] = useState(false);
  const toggleCommentVisible = () => {
    setCommentVisible(!commentVisible);
  };
  // esc触发关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setCommentVisible(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
      <>
        <DivCom>
          <Likes />
          {/* 评论 */}
          <a className="text-decoration-none cursor-pointer" onClick={()=>toggleCommentVisible()} >
            <Comment />
          </a>
          {/* 收藏信息 */}
          <Collection />
          {/* 分享 */}
          <Share />
        </DivCom>

        <Drawer
          title={t('comment')}
          isOpen={commentVisible}
          onClose={()=>setCommentVisible(false)}
          size={600}
          hasBackdrop={false}
          usePortal={false}
          hasOverLay={false}
        >
          <ArticleComments />
        </Drawer>
      </>
    );
};
export default ToolBar;