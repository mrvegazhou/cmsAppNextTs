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

interface propsType {
  minWidth?: number;
  height?: string;
  width?: string;
  cls?: string;
  bodyStyle?: React.CSSProperties;
  portalProps?: PortalProps;
}
export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element, props?: propsType) => void,
] {
  const [modalContent, setModalContent] = useState<null | {
    content: JSX.Element;
    title: string;
    props?: propsType;
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
    const {title, content, props} = modalContent;
    return (
      <Modal
        title={title}
        isOpen={open}
        onClosed={()=>{setOpen(false);onClose();}}
        type="light"
        useButton={false}
        minWidth={props?.minWidth ?? 350}
        height={props?.height}
        width={props?.width}
        className={props?.cls}
        bodyStyle={props?.bodyStyle}
        portalProps={props?.portalProps}
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
      props?: propsType,
    ) => {
      setOpen(true);
      setModalContent({
        title,
        content: getContent(onClose),
        props
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
