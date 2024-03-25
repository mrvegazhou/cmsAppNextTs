import type {
    IBase,
    ITag,
    IUser,
  } from '@/interfaces';
  
  
  export interface ICreateSectionBody {
    name: string;
  }
  
  export interface IUpdateSectionBody {
    name?: string;
    cover?: string;
    overview?: string;
    sort?: string;
  }
  
  export interface IUploadSectionCoverBody {
    file?: string | Blob;
    formData?: FormData;
  }
  
  export interface IUploadSectionContentBody {
    file?: string | Blob;
    signal?: AbortSignal;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
    formData?: FormData;
  }
  
  
  export interface IUpdateSectionStatusBody {
    status: string;
    secret?: string;
    allow?: number[];
    block?: number[];
  }
  
  export interface IUpdateSectionContentBody {
    content: string;
  }
  
  export interface IUpdateSectionTagByNameBody {
    name: string;
  }
  
  export interface IRemoveSectionTagByNameBody {
    name: string;
  }
  
  export interface IUpdateSectionAdminByUserIdBody {
    userId: string;
  }
  
  export interface IRemoveSectionAdminByUserIdBody {
    userId: string;
  }
  
  export interface ISectionStatistics {
    count: number;
  }
  
  export interface IUploadSectionCover {
    urls: {
      default: string;
    };
  }
  
  export interface IUploadSectionContentFile {
    urls: {
      default: string;
    };
  }
  