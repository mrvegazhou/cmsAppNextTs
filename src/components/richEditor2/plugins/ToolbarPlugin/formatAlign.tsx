import React from 'react';
import { ElementFormatType, LexicalEditor, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';


export const FUNC_ELEMENT_FORMAT_OPTIONS = (): {
    [key in Exclude<ElementFormatType, ''>]: {
        icon: string;
        iconRTL: string;
        name: string;
    };
} => {
    const t = useTranslations('ArticleEditPage');
    return {
        center: {
            icon: 'icon-juzhongduiqi',
            iconRTL: 'icon-juzhongduiqi',
            name: t('formatCenter') //'中心对齐',
        },
        start: {
            icon: 'icon-zuoduiqi',
            iconRTL: 'icon-zuoduiqi',
            name: t('formatStart') //'开始对齐',
        },
        end: {
            icon: 'icon-zuoduiqi',
            iconRTL: 'icon-zuoduiqi',
            name: t('formatEnd') //'尾部对齐',
        },
        justify: {
            icon: 'icon-zuoyouduiqi',
            iconRTL: 'icon-zuoyouduiqi',
            name: t('formatJustify') //'两端对齐',
        },
        left: {
            icon: 'icon-zuoduiqi',
            iconRTL: 'icon-zuoduiqi',
            name: t('formatLeft') //'左对齐',
        },
        right: {
            icon: 'icon-zuoduiqi',
            iconRTL: 'icon-zuoduiqi',
            name: t('formatRight') //'右对齐',
        }
    }
};


export default function ElementFormatDropdown({
    editor,
    value,
    isRTL,
    disabled = false,
  }: {
    editor: LexicalEditor;
    value: ElementFormatType;
    isRTL: boolean;
    disabled: boolean;
  }) {
    const ELEMENT_FORMAT_OPTIONS = FUNC_ELEMENT_FORMAT_OPTIONS();
    const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];
    const [open, setOpen] = React.useState(false);
    return (
      <Dropdown
          disabled={disabled}
          trigger="click"
          onVisibleChange={(isOpen) => setOpen(isOpen)}
          isOpen={open}
          menu={
            <div>
              <Menu bordered style={{ minWidth: 120 }}>
                {Object.keys(ELEMENT_FORMAT_OPTIONS).map((item, idx) => {
                    let icon = ELEMENT_FORMAT_OPTIONS.start.icon;
                    if (item=='start' || item=='end') {
                      icon = isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon
                    }
                    return (
                      <Menu.Item
                        key={item}
                        // @ts-ignore
                        text={ELEMENT_FORMAT_OPTIONS[item].name}
                        iconClass={icon}
                        // @ts-ignore
                        onClick={() => {editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, item.toLowerCase()); setOpen(false);}}
                      />
                    );
                })}
                <Menu.Divider />
                <Menu.Item
                    text='减少缩进'
                    iconClass={isRTL ? 'icon-formatindentdecrease' : 'icon-format-indent-increase'}
                    onClick={() => {editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined); setOpen(false);}}
                />
                <Menu.Item
                    text='缩进'
                    iconClass={isRTL ? 'icon-format-indent-increase' : 'icon-formatindentdecrease'}
                    onClick={() => {editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined); setOpen(false);}}
                />
              </Menu>
            </div>
          }
        >
          <div className='icon-font'>
            <i className={`iconfont fs-5 ${isRTL ? formatOption.iconRTL : formatOption.icon}`}></i>
            <span>{formatOption.name}</span>
            <i className={classNames('iconfont', {'icon-xiangxia': !open}, {'icon-xiangshang': open})}></i>
          </div>
      </Dropdown>
    );
}