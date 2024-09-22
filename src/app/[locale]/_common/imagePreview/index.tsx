"use client";

import { useEffect, useRef, useState } from "react";
import style from "./index.module.scss";
import ImgsViewer from "react-images-viewer";

/** 文章页面图片预览*/
const ImagePreview = () => {
    const [preview, setPreview] = useState("");
    const imgRef = useRef(null);
    useEffect(() => {
      let imgs = document.querySelectorAll(
        `#articleCententView img`,
      ) as unknown as HTMLCollectionOf<HTMLImageElement>;

      function setPreviewSrc(e: any) {
        console.log(e?.target?.src, "===imgs===")
        if (e?.target?.src) setPreview(e?.target?.src);
      }
      for (let index = 0; index < imgs.length; index++) {
        const element = imgs[index];
        element.addEventListener("click", setPreviewSrc);
      }
  
      return () => {
        for (let index = 0; index < imgs.length; index++) {
          const element = imgs[index];
          element.removeEventListener("click", setPreviewSrc);
        }
      };
    }, []);
  
    return (
      <>
        <div className={style["preview"]} id="preview">
            <PhotoProvider>
                <PhotoView src={preview}>
                    <img src={preview}  style={{ display: "none" }} width={0} ref={imgRef} />
                </PhotoView>
            </PhotoProvider>
        </div>
      </>
    );
  };
  export default ImagePreview;
  