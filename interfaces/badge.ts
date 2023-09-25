import type { IBase } from '@/interfaces';
import type { TBadgeBackgroundColorMode, TBadgeColorMode } from '@/types';

export interface IPostBadge extends IBase {
  id: number;
  name: string;
  sort: number;
  reason?: string;
  colorMode: TBadgeColorMode;
  color: string;
  backgroundColorMode: TBadgeBackgroundColorMode;
  backgroundColor: string;
  roundedPill: boolean;
}
