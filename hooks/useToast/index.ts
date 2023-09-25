import { useContext } from 'react';
import Link from 'next/link';
import { ToastContext } from '@/contexts/toast';

export default function useToast() {
  const { show, hide, isLoadingToastShowing } = useContext(ToastContext);

  return {
    show,
    hide,
    showToast: show,
    hideToast: hide,
    isLoadingToastShowing,
  };
}