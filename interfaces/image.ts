import type {
    IBase
  } from '@/interfaces';

export interface IImage extends IBase {
    id: number;
    name: string;
    width?: number;
    height?: number;
    tags?: string;
}

export interface IImageList {
    imgList: IImage[];
    page: number;
    totalPage: number;
}