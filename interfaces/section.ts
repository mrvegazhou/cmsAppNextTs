import type {
    IBase,
    IPagination,
    IPost,
    ISectionGroup,
    ITag,
    ITagGroup,
    IUser,
  } from '@/interfaces';
  import type { TSectionOtherState, TSectionState } from '@/types';
  
  export interface ISectionClient extends ISection {
    postCount: number;
    tagCount: number;
    sectionGroup?: ISectionGroup;
    admins: IUser[];
    tags: ITag[];
  }
  
  export interface ISection extends IBase {
    id: number;
    cover?: string;
    name: string;
    state: TSectionState;
    otherStates: TSectionOtherState[];
    overview?: string;
    sort: number;
    allow?: number[];
    block?: number[];
  }
  
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
  
  export interface ISectionDetails {
    basic: ISection;
    content?: string;
    tagGroups?: ITagGroup[];
    sectionGroup?: ISectionGroup;
    tags: ITag[];
    admins: IUser[];
    data?: IPagination<IPost>;
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
  