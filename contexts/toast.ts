import { createContext } from 'react';
import type { IToastProps } from '@/interfaces';

export const ToastContext = createContext<{
  isLoadingToastShowing: boolean;
  show: (toastProps?: IToastProps) => string;
  hide: (id: string) => void;
}>({
  isLoadingToastShowing: false,
  show: () => '',
  hide: () => undefined,
});