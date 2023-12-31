import type {
  IBase
} from '@/interfaces';

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
}

export interface IArticleUploadImages {
  files?: string[] | Blob[];
  urls?: string[];
  formData?: FormData;
}

export interface IUploadArticleContent {
  urls: {
    default: string;
  };
}

