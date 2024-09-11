import styled from "styled-components";
import { useTranslations } from 'next-intl';
import dynamic from "next/dynamic";

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

  return (
      <>
        <DivCom>
          <Likes />
          {/* 评论 */}
          <a className="text-decoration-none" aria-controls="offcanvasArticleComments" data-bs-toggle="offcanvas" href="#offcanvasArticleComments">
          <Comment />
          </a>
          {/* 收藏信息 */}
          <Collection />
          {/* 分享 */}
          <Share />
        </DivCom>

        <div className="offcanvas offcanvas-end" data-bs-scroll="false" aria-labelledby="offcanvasScrollingLabel" style={{width: '35%'}} data-bs-backdrop="false" id="offcanvasArticleComments">
            <div className="offcanvas-header">
                <h6 className="offcanvas-title" id="offcanvasScrollingLabel">{t('comment')}</h6>
                <div className="btn-close cursor-pointer" data-bs-dismiss="offcanvas" aria-label="Close"></div>
            </div>
            <div className="offcanvas-body" >
                <div id="xxx">
                  <ArticleComments />
                </div>
            </div>
        </div>
      </>
    );
};
export default ToolBar;