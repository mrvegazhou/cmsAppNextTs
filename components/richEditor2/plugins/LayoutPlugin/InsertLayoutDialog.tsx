/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {LexicalEditor} from 'lexical';
import * as React from 'react';
import {useState} from 'react';
import classNames from 'classnames';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';

import {INSERT_LAYOUT_COMMAND} from './LayoutPlugin';

const LAYOUTS = [
  {label: '2列 (equal width)', value: '1fr 1fr'},
  {label: '2列 (25% - 75%)', value: '1fr 3fr'},
  {label: '3列 (equal width)', value: '1fr 1fr 1fr'},
  {label: '3列 (25% - 50% - 25%)', value: '1fr 2fr 1fr'},
  {label: '4列 (equal width)', value: '1fr 1fr 1fr 1fr'},
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [columnsLayoutOpen, setColumnsLayoutOpen] = useState(false);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout.value);
    onClose();
  };

  return (
    <div className='text-center'>
      <Dropdown
        trigger="click"
        onVisibleChange={(isOpen) => setColumnsLayoutOpen(isOpen)}
        isOpen={columnsLayoutOpen}
        zIndex={9999}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120}}>
              {LAYOUTS.map(({label, value}, idx) => {
                  const active = layout.value === value;
                  return (
                    <Menu.Item
                      key={idx}
                      active={active}
                      text={label}
                      iconClass=''
                      onClick={() => {setLayout(LAYOUTS[idx]); setColumnsLayoutOpen(false);}}
                    />);
                }
              )}
            </Menu>
          </div>
        }
      >
        <div>
          <span>{layout.label}</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !columnsLayoutOpen}, {'icon-xiangshang': columnsLayoutOpen})}></i>
        </div>
      </Dropdown>
      <div className='form-row text-center mt-4 mb-3'>
        <button type="button" onClick={onClick} className="btn btn-outline-primary">插入</button>
      </div>
    </div>
  );
}
