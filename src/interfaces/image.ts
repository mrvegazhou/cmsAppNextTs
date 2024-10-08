import type {
    IBase
  } from '@/interfaces';

export interface IImage extends IBase {
    fileName: string;
    imgName?: string;
    width?: number;
    height?: number;
    dataRawWidth?: string;
    dataRawHeight?: string;
    tag?: string;
    src?: string;
    imgId?: number;
}

export interface IImageList {
    imgList: IImage[];
    page: number;
    totalPage: number;
}

export type IImageState = {
    loading?: boolean;
    image: IImage;
    formData: FormData;
    err?: Error | null;
    uploaded?: boolean;
    resourceId?: number;
    imgId?: number;
};

export interface IUploadImages {
    type: string;
    resourceId?: string;
    formData: FormData;
}

export interface IUploadImageResp {
    imageName: string; 
    fileName: string; 
    resourceId: number;
    imgId?: number;
}
