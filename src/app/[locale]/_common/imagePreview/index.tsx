"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import ImageViewer from "@/components/imageViewer";
import { isNullAndUnDef, isNullOrUnDef } from "@/lib/is";

interface PropsType {
    images?: string[];
    isViewerOpen?: boolean;
    ident?: string;
}
export type imagePreviewRef = {
    hide: () => void;
    show: () => void;
};
/** 文章页面图片预览*/
const ImagePreview = forwardRef<imagePreviewRef, PropsType>((props, ref) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(props.isViewerOpen ?? false);
    const [images, setImages] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
        hide: () => setIsViewerOpen(false),
        show: () => setIsViewerOpen(true),
    }));

    useEffect(() => {
        if (!isNullOrUnDef(props.images) && props.images.length>0) setImages(props.images);
    }, [props.images]);

    useEffect(() => {
        if (!isNullAndUnDef(props.isViewerOpen)) setIsViewerOpen(props.isViewerOpen);
    }, [props.isViewerOpen]);

    useEffect(() => {
        if (isNullOrUnDef(props.ident)) return;
        
        let imgs = document.querySelectorAll(
            `#${props.ident} img`,
        ) as unknown as HTMLCollectionOf<HTMLImageElement>;

        function setPreviewSrc(e: any) {
            if (e?.target?.src) {
                setImages([e?.target?.src]);
                setIsViewerOpen(true);
            }
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

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };
  
    return (
      <>
        {isViewerOpen  && (
            <ImageViewer
                src={ images.length>0 ? images : [] }
                currentIndex={ 0 }
                disableScroll={ false }
                closeOnClickOutside={ true }
                backgroundStyle={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                }}
                onClose={ closeImageViewer }
            />
        )}
      </>
    );
});
ImagePreview.displayName = "ImagePreview";
export default ImagePreview;
  