import classNames from "classnames";
import { useRecoilValue } from "recoil";
import { itemClassName, iconClassName, DivDom } from "./class";
import { currentArticleDataContext } from '@/store/articleData';
import BadgeComp from '@/components/badge/badge';

const Comment = () => {
  let currentArticleData = useRecoilValue(currentArticleDataContext);
  const scrollToAnchor = () => {
    // 找到锚点
    let anchorElement = document.getElementById("comment");
    // 如果对应id的锚点存在，就跳转到锚点
    if(anchorElement) { anchorElement.scrollIntoView({block: 'start', behavior: 'smooth'}); }
  };
  return (
        <>
          <DivDom className={classNames([itemClassName])} onClick={scrollToAnchor}>
            <BadgeComp count={currentArticleData.commentCount} style={{top:-20, left:30, backgroundColor:'rgba(var(--bs-secondary-rgb), 0.8)'}}>
              <i className={classNames([iconClassName, "iconfont icon-comment"])}></i>
            </BadgeComp>
          </DivDom>
        </>
  );
};
export default Comment;