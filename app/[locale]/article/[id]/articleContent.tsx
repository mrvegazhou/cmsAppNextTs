import type { FC } from "react";
import styles from './articleContent.module.scss';

interface prposType {
  content: string;
}

/** 文章页面主题内容显示*/
const ContentComp: FC<prposType> = props => {
  return (
    <div
      id="view"
      className={styles.article}
      dangerouslySetInnerHTML={{ __html: props.content }}
    ></div>
  );
};
export default ContentComp;