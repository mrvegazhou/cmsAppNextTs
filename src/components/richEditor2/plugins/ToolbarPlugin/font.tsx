import { $getSelection, LexicalEditor } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';


export const FONT_FAMILY_OPTIONS: [string, string][] = [
    ['Arial', 'Arial'],
    ['Courier New', 'Courier New'],
    ['Georgia', 'Georgia'],
    ['Times New Roman', 'Times New Roman'],
    ['Trebuchet MS', 'Trebuchet MS'],
    ['Verdana', 'Verdana'],
];

export const FONT_SIZE_OPTIONS: [string, string][] = [
    ['10px', '10px'],
    ['11px', '11px'],
    ['12px', '12px'],
    ['13px', '13px'],
    ['14px', '14px'],
    ['15px', '15px'],
    ['16px', '16px'],
    ['17px', '17px'],
    ['18px', '18px'],
    ['19px', '19px'],
    ['20px', '20px'],
];

export default function FontDropDown({
    editor,
    value,
    style,
    disabled = false,
  }: {
    editor: LexicalEditor;
    value: string;
    style: string;
    disabled?: boolean;
  }): JSX.Element {
    const t = useTranslations('ArticleEditPage');
  
    const handleClick = useCallback(
      (option: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, {
              [style]: option,
            });
          }
        });
      },
      [editor, style],
    );
  
    const [open, setOpen] = React.useState(false);
    let labelName = style === 'font-family' ? t('fontSetting') : t('fontSize');
  
    return (
        <Dropdown
          disabled={disabled}
          trigger="click"
          onVisibleChange={(isOpen) => setOpen(isOpen)}
          isOpen={open}
          menu={
            <div>
              <Menu bordered style={{ minWidth: 120 }}>
                {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(([option, text]) => {
                    const active = value === option;
                    return (
                      <Menu.Item
                        key={option}
                        active={active}
                        text={text}
                        iconClass=''
                        onClick={() => {handleClick(option); setOpen(false);}}
                      />
                    );
                })}
              </Menu>
            </div>
          }
        >
          <div className='icon-font' title={style === 'font-family' ? t('fontSetting') : t('fontSize')}>
            <i className={classNames('iconfont fs-5', {'icon-zitidaxiao1': style==='font-size', 'icon-bx-font-family': style==='font-family'})}></i>
            <span>{value ?? labelName}</span>
            <i className={classNames('iconfont', {'icon-xiangxia': !open}, {'icon-xiangshang': open})}></i>
          </div>
        </Dropdown>
    );
  }