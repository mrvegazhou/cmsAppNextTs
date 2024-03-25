import type { IBase, ITag } from '@/interfaces';

export interface ITagGroup extends IBase {
  name: string;
  sort: number;
  tags?: ITag[];
}

export interface ITagGroupStatistics {
  count: number;
}

export interface ICreateTagGroupBody {
  name: string;
}

export interface IUpdateTagGroupBody {
  name: string;
}

export interface ICreateSectionTagGroupBody {
  sectionId: string;
}

export interface ICreateTagTagGroupBody {
  tagId: string;
  sort: number;
}

export interface ICreatePostTagGroupBody {
  tagId: string;
  postId: string;
}

export interface IRemoveSectionTagGroupBody {
  sectionId: string;
}

export interface IRemoveTagTagGroupBody {
  tagId: string;
}

export interface IRemovePostTagGroupBody {
  tagId: string;
  postId: string;
}
