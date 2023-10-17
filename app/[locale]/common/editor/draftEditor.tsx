"use client";
import { useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { writeArticleContext } from "@/store/articleData";

const DraftsEditor = () => {
    let article = useRecoilValue(writeArticleContext);

    /** 判断按钮是否禁止点击*/
    let isDisabled = useMemo(() => {
        return (
            !/^[\s\S]*.*[^\s][\s\S]*$/.test(article.title) ||
            article.title.length > 199 ||
            article.content.length < 20 ||
            article.tags.length == 0
        );
    }, [article.title, article.content, article.tags]);

    let [isLoad, setIsLoad] = useState(false);

    function createDrafts() {
        if (isDisabled) {
            return;
        }
        setIsLoad(true);

    }

    return (
        <>
          <div
            ghost
            type="primary"
            onClick={pathname == "/article/editor" ? createDrafts : updateDrafts}
            disabled={isDisabled}
            loading={isLoad}
            title={isDisabled ? "需填写标题、文章内容、标签" : undefined}
          >
            保存至草稿箱
          </div>
        </>
      );
}
export default DraftsEditor;