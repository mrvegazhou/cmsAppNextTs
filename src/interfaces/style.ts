import type { IBase } from '@/interfaces';
import type {
  TStyleBackgroundColorMode,
  TStyleColorMode,
  TStyleType,
} from '@/types';

export interface IPostStyle extends IBase {
  id: number;
  name: string;
  type: TStyleType;
  colorMode: TStyleColorMode;
  color?: string;
  backgroundColorMode: TStyleBackgroundColorMode;
  backgroundColor?: string;
  icons: string[];
  styles: Record<string, string>;
  classes: string[];
  useStyle: boolean;
  useClass: boolean;
}
