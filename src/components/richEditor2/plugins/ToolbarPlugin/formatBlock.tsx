import React, { useCallback } from 'react';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    LexicalEditor
} from 'lexical';
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
    $setBlocksType,
} from '@lexical/selection';
import {
    $createHeadingNode,
    $createQuoteNode,
    HeadingTagType,
} from '@lexical/rich-text';
import {
    $createCodeNode
} from '@lexical/code';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';


export const rootTypeToRootName = {
    root: 'Root',
    table: 'Table',
};

export type blockTypeToBlockNameType = 'bullet' | 'check' | 'code' 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' 
  | 'number' | 'paragraph' | 'quote';

export const FUNC_BLOCK_TYPE_TO_BLOCKNAME = (): {[key: string]: string} => {
  const t = useTranslations('ArticleEditPage');
  return {
    paragraph: t('normal'), //'常规',
    h1: 'H1',
    h2: 'H2',
    h3: 'H3',
    h4: 'H4',
    h5: 'H5',
    h6: 'H6',
    bullet: t('bulletList'), //'符号列表',
    check: t('checkList'), //'清单',
    code: t('codeBlock'), //'代码块',
    number: t('numberList'), //'编号列表',
    quote: t('quote'), //'引用'
  }
};


export default function BlockFormatDropDown({
    editor,
    blockType,
    rootType,
    disabled = false,
}: {
    blockType: blockTypeToBlockNameType;
    rootType: keyof typeof rootTypeToRootName;
    editor: LexicalEditor;
    disabled?: boolean;
}): JSX.Element {

    const blockTypeToBlockName = FUNC_BLOCK_TYPE_TO_BLOCKNAME();

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        console.log(headingSize, '---headingSize--')
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatCheckList = () => {
        if (blockType !== 'check') {
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatNumberedList = () => {
        if (blockType !== 'number') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatQuote = () => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createQuoteNode());
            });
        }
    };

    const formatCode = () => {
        if (blockType !== 'code') {
            editor.update(() => {
                let selection = $getSelection();

                if (selection !== null) {
                    if (selection.isCollapsed()) {
                        $setBlocksType(selection, () => $createCodeNode());
                    } else {
                        const textContent = selection.getTextContent();
                        const codeNode = $createCodeNode();
                        selection.insertNodes([codeNode]);
                        selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertRawText(textContent);
                        }
                    }
                }
            });
        }
    };

    const blockTypeToBlockFn: { [key: string]: any } = {
        paragraph: {
            iconClass: 'icon-paragraph icon-font opacity-75',
            fn: formatParagraph,
            type: ''
        },
        h: {
            iconClass: '',
            fn: '',
            type: ''
        },
        bullet: {
            iconClass: 'icon-unorderedList icon-font opacity-75',
            fn: formatBulletList,
            type: ''
        },
        check: {
            iconClass: 'icon-linear-ele-symbol-check-list-finished icon-font opacity-75',
            fn: formatCheckList,
            type: ''
        },
        code: {
            iconClass: 'icon-daima icon-font opacity-75',
            fn: formatCode,
            type: ''
        },
        number: {
            iconClass: 'icon-youxuliebiao icon-font opacity-75',
            fn: formatNumberedList,
            type: ''
        },
        quote: {
            iconClass: 'icon-quote icon-font opacity-75',
            fn: formatQuote,
            type: ''
        }
    };

    const blockTypeToBlockTitles: { [key: string]: any } = {
        h1: {
            iconClass: '',
            fn: formatHeading,
            type: 'h1'
        },
        h2: {
            iconClass: '',
            fn: formatHeading,
            type: 'h2'
        },
        h3: {
            iconClass: '',
            fn: formatHeading,
            type: 'h3'
        },
        // h4: {
        //     iconClass: '',
        //     fn: formatHeading,
        //     type: blockType
        // },
        // h5: {
        //     iconClass: '',
        //     fn: formatHeading,
        //     type: blockType
        // },
        // h6: {
        //     iconClass: '',
        //     fn: formatHeading,
        //     type: blockType
        // }
    }

    const executeCommand = (fn: Function, type: string) => {
        if (typeof fn === 'function') {
            type == "" ? fn() : fn(type);
        }
    };

    const [open, setOpen] = React.useState(false);
    const iconTitle = useCallback(() => {
        let icon = null;
        let name = '';
        if (['h1', 'h2', 'h3'].includes(blockType as string)) {
            icon = blockType;
        } else {
            icon = <i className={classNames("iconfont fs-5", blockTypeToBlockFn[blockType].iconClass)}></i>
            name = blockTypeToBlockName[blockType];
        }
        return (
            <>
                {icon}<span>{name}</span><i className={classNames('iconfont', { 'icon-xiangxia': !open }, { 'icon-xiangshang': open })}></i>
            </>
        );
    }, [blockType]);

    return (
        <Dropdown
            disabled={disabled}
            trigger="click"
            onVisibleChange={(isOpen) => setOpen(isOpen)}
            isOpen={open}
            menu={
                <div>
                    <Menu bordered style={{ minWidth: 50 }}>
                        {Object.keys(blockTypeToBlockFn).map((item, idx) => {
                            const active = blockType === item;
                            if (item == 'h') {
                                return (
                                    <Menu.SubMenu key={idx} iconClass="icon-zitibiaoti" text="标题" collapse={true} overlayProps={{ isOpen: false }}>
                                        {Object.keys(blockTypeToBlockTitles).map((key) => {
                                            const value = blockTypeToBlockTitles[key];
                                            return (
                                                <Menu.Item
                                                    key={key}
                                                    iconClass={value['iconClass']}
                                                    active={blockType==key}
                                                    onClick={() => { executeCommand(value.fn, key); setOpen(false) }}
                                                    text={blockTypeToBlockName[key]} />
                                            );
                                        })}
                                    </Menu.SubMenu>
                                );
                            } else {
                                return (
                                    <Menu.Item
                                        key={idx}
                                        active={active}
                                        text={blockTypeToBlockName[item]}
                                        iconClass={blockTypeToBlockFn[item].iconClass}
                                        onClick={() => { executeCommand(blockTypeToBlockFn[item].fn, blockTypeToBlockFn[item].type); setOpen(false) }}
                                    />
                                );
                            }
                        })}
                    </Menu>
                </div>
            }
        >
            <div className='icon-font'>{iconTitle()}</div>
        </Dropdown>
    );
}