import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { TMetadata } from '@/types';
import type { IModalProps } from '@/interfaces';

export const ModalContext = createContext<{
  isLoadingModalShowing: boolean;
  show: (modalProps?: IModalProps) => string;
  hide: (id?: string) => void;
  metadata?: TMetadata;
  setMetadata?: Dispatch<SetStateAction<TMetadata | undefined>>;
}>({
  isLoadingModalShowing: false,
  show: () => '',
  hide: () => undefined,
  setMetadata: () => undefined,
});
