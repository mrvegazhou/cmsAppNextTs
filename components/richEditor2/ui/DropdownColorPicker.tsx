/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react';
import classNames from 'classnames';

import ColorPicker from './ColorPicker';
import Dropdown from '@/components/dropdown';
import { Menu } from '@/components/menu/Menu';

type Props = {
  disabled?: boolean;
  title?: string;
  color: string;
  type?: string;
  onChange?: (color: string) => void;
};

export default function DropdownColorPicker({
  disabled = false,
  color,
  onChange,
  ...rest
}: Props) {
  const [open, setOpen] = React.useState<boolean>();

  function IconFont({title, type}: {title: string; type: string}): JSX.Element {
    let icon = <i className='iconfont icon-font-color fs-5 opacity-75'></i>;
    let colorIcon = (color !== '#000') ? <span style={{color: color}}>{title}</span> : <span>{title}</span>;
    if ( type === 'bgColor' ) {
      icon = <i className='iconfont icon-ziyuan fs-5'></i>
      colorIcon = <span style={{backgroundColor: color+'30'}}>{title}</span>;
    }
    return (
      <div className='icon-font'>
        {icon}
        {colorIcon}
        <i className={classNames('iconfont', {'icon-xiangxia': !open}, {'icon-xiangshang': open})}></i>
      </div>
    );
  }
  return (
    <Dropdown
        disabled={disabled}
        trigger="click"
        onVisibleChange={(isOpen) => setOpen(isOpen)}
        isOpen={open}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120 }}>
              <ColorPicker color={color} onChange={onChange} />
            </Menu>
          </div>
        }
      >
        <div className='icon-font'>
          <IconFont type={rest.type!} title={rest.title!} />
        </div>
    </Dropdown>
  );
}
