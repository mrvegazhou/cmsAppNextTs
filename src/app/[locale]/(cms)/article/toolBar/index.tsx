import styled from "styled-components";
import Likes from "./like";
import Collection from "./collection";
import Comment from "./comment";
import Share from "./share";

const DivCom = styled.div`
    left:max(0px, calc(50vw - 680px));
    position:fixed;
    top:8rem;
    height:280px;
    width:70px;
`

const ToolBar = () => {
    return (
        <>
          <DivCom>
            {/* 点赞信息 */}
            <Likes />
            {/* 评论 */}
            <Comment />
            {/* 收藏信息 */}
            <Collection />
            {/* 分享 */}
            <Share />
          </DivCom>
        </>
      );
};
export default ToolBar;