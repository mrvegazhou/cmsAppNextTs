/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useCallback, useMemo, useState} from 'react';
import * as React from 'react';
import Modal from '@/components/modal';
import { PortalProps } from '@/components/portal/portal';


export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element, minWidth?: number, cls?: string, portalProps?: PortalProps) => void,
] {
  const [modalContent, setModalContent] = useState<null | {
    content: JSX.Element;
    title: string;
    minWidth?: number;
    cls?: string;
    portalProps?: PortalProps;
  }>(null);

  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setModalContent(null);
    setOpen(false);
  }, []);

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const {title, content, minWidth, cls, portalProps} = modalContent;
    return (
      <Modal
        title={title}
        isOpen={open}
        onClosed={()=>{setOpen(false);onClose();}}
        type="light"
        useButton={false}
        minWidth={minWidth ?? 350}
        className={cls}
        portalProps={portalProps}
      >
         {content}
      </Modal>
    );
  }, [open, modalContent, onClose]);

  const showModal = useCallback(
    (
      title: string,
      // eslint-disable-next-line no-shadow
      getContent: (onClose: () => void) => JSX.Element,
      minWidth?: number,
      cls?: string,
      portalProps?: PortalProps
    ) => {
      setOpen(true);
      setModalContent({
        title,
        content: getContent(onClose),
        minWidth: minWidth,
        cls: cls,
        portalProps: portalProps
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
