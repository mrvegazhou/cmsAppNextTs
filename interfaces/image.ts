import type {
    IBase
  } from '@/interfaces';

export interface IImage extends IBase {
    name: string;
    width?: number;
    height?: number;
    tag?: string;
    src?: string;
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
};