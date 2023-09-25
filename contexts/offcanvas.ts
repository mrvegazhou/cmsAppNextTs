import { createContext } from 'react';
import type { IOffcanvasProps } from '@/interfaces';

export const OffcanvasContext = createContext<{
  isLoadingOffcanvasShowing: boolean;
  show: (offcanvasProps?: IOffcanvasProps) => string;
  hide: (id: string) => void;
}>({
  isLoadingOffcanvasShowing: false,
  show: () => '',
  hide: () => undefined,
});