import type { BaseTypeProps } from '../utils';
import type { CaptchaModel } from '../PropsType';

export interface SliderProps extends BaseTypeProps {
  captcha: CaptchaModel;
  onValid: (data: string, second: any) => Promise<boolean>;
}
