import type { IBase } from '@/interfaces';

export interface IRole extends IBase {
  name: string;
  sort: number;
  hide: boolean;
}

export interface ICreateRoleBody {
  name: string;
}

export interface IUpdateRoleBody {
  name?: string;
  sort?: number;
  hide?: boolean;
}

export interface IAssignRoleBody {
  userId: string;
}

export interface IUnAssignRoleBody {
  userId: string;
}

export interface IRoleStatistics {
  count: number;
}
