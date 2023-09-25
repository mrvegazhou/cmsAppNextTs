import type { IBase, ITagGroup } from '@/interfaces';

export interface ITag extends IBase {
  id: number;
  name: string;
  tagGroups?: ITagGroup[];
}

export interface ICreateTagBody {
  name: string;
}

export interface IUpdateTagBody {
  name: string;
}

export interface ITagStatistics {
  count: number;
}
