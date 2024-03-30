import type {
  IBase, ITag, IUser, IImage
} from '@/interfaces';

export interface IArticle extends IBase {
  id: number;
  title: string;
  authorId?: number;
  content: string;
  description: string;
  tags: string;
  typeId: number;
  coverUrl?: string;
  isSetCatalog: number;
  viewCount?: number;
  commentCount?: number;
  collectionCount?: number;
  likeCount?: number;
  shareCount?: number;
  createTime?: string;
  updateTime?: string;
}

export interface IArticleDraft {
  id?: number;
  articleId: number;
  title: string;
  authorId?: number;
  content: string;
  description: string;
  coverUrl: string;
  isSetCatalog: number;
  tags: ITag[] | number[];
  typeId: number;
  createTime?: string;
  sourceType?: string;
  saveType?: number;
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

export interface IArticleImgRes {
  imageName: string; 
  fileName: string; 
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

export interface ICollabTokenInfo {
  roomName?: string;
  userName?: string;
  cursorColor?: string;
  isCollab: boolean;
  token?: string;
  isMe?: boolean;
  user?: string;
}

// 文章atom store初始化
export interface IArticleInit {
  id: number | null;
  title: string;
  content: string;
  tags: ITag[];
  typeId: number;
  coverImage: IImage;
  description: string;
  createTime: string | null;
  isSetCatalog: number;
}

