import type {
  IBase, IUser, IUserList
} from '@/interfaces';
import { IImage } from './image';

export interface IArticle extends IBase {
  id: number;
  title: string;
  authorId?: number;
  content: string;
  description: string;
  tags: number[];
  coverUrl?: string;
  viewCount?: number;
  commentCount?: number;
  collectionCount?: number;
  likeCount?: number;
  shareCount?: number;
  createTime?: string;
  updateTime?: string;
}

export interface IArticleFavorites {
  name: string;
  id: number;
  isChecked: boolean;
}

export interface IArticleToolBarData {
  isLiked: boolean;
  isCollected: boolean;
  favorites: {[key:number]:IArticleFavorites};

}

export interface IArticleId {
  articleId: number;
}

export interface IArticleUploadImage {
  file?: string | Blob;
  formData?: FormData;
  type?: number;
}

export interface IArticleUploadImages {
  files?: string[] | Blob[];
  urls?: string[];
  type?: number;
  articleId?: number;
  formData?: FormData;
}

export interface IArticleUploadImage {
  image?: string | Blob;
  formData?: FormData;
}

export interface IUploadArticleContent {
  urls: {
    default: string;
  };
}

export interface IArticleType {
  id: number;
  name: string;
}

export interface IArticleCollabView {
  [Key: number]: {"userList": IUser[]; "articleInfo": {"info": IArticle; "tokenUrl": string}};
}