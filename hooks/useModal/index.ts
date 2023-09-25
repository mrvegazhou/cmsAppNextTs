import { useContext, useEffect } from 'react';
import type { TMetadata } from '@/types';
import { ModalContext } from '@/contexts/modal';

export default function useModal({ metadata }: { metadata?: TMetadata } = {}) {
  const {
    show,
    hide,
    isLoadingModalShowing,
    metadata: _metadata,
    setMetadata,
  } = useContext(ModalContext);

  useEffect(() => {
    if (metadata) {
      setMetadata?.(metadata);
    }
  }, [metadata, setMetadata]);

  return {
    metadata: _metadata,
    show,
    hide,
    showModal: show,
    hideModal: hide,
    isLoadingModalShowing,
  };
}
