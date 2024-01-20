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


export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element, minWidth?:number,) => void,
] {
  const [modalContent, setModalContent] = useState<null | {
    content: JSX.Element;
    title: string;
    minWidth?: number;
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
    const {title, content, minWidth} = modalContent;
    return (
      <Modal
        title={title}
        isOpen={open}
        onClosed={()=>{setOpen(false);onClose();}}
        type="light"
        useButton={false}
        minWidth={minWidth ?? 350}
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
      minWidth?: number
    ) => {
      setOpen(true);
      setModalContent({
        title,
        content: getContent(onClose),
        minWidth: minWidth
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
