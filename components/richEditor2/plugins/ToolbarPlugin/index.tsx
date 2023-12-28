/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$isDecoratorBlockNode} from '@lexical/react/LexicalDecoratorBlockNode';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import {$isTableNode} from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $INTERNAL_isPointSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical';
import React, {Dispatch, useCallback, useEffect, useState} from 'react';
import {IS_APPLE} from '../../shared/environment';

import classNames from 'classnames';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';

import useModal from '../../hooks/useModal';
// import catTypingGif from '../../images/cat-typing.gif';
// import {$createStickyNode} from '../../nodes/StickyNode';
// import DropDown, {DropDownItem} from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {sanitizeUrl} from '../../utils/url';
// import {EmbedConfigs} from '../AutoEmbedPlugin';
// import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
// import {InsertEquationDialog} from '../EquationsPlugin';
// import {INSERT_EXCALIDRAW_COMMAND} from '../ExcalidrawPlugin';
import {InsertImageDialog} from '../ImagesPlugin';
import {InsertInlineImageDialog} from '../InlineImagePlugin';
import {InsertTableDialog} from '../TablePlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import InsertVideoIframeDialog from '../VideoIframePlugin/InsertVideoIframeDialog';

function Divider(): JSX.Element {
  return <div className="vr vr-blurry mx-2" style={{height: '20px'}}></div>
}

function ToolIcon({title='', disabled=false, label, iconName, click, active}: 
  { disabled?: boolean; 
    label: string; 
    iconName: string; 
    click: Function; 
    active?: boolean;
    title: string;
  }): JSX.Element {
  return (
    <div className={classNames('icon-font', {'active': active, 'disabled': disabled})} onClick={()=>{click();}} title={title}>
        <i className={classNames('iconfont opacity-75 fs-5', iconName)}></i>
        <span className='icon-font-name'>{label}</span>
    </div>
  );
}

const blockTypeToBlockName: {[key:string]: string} = {
  bullet: '符号列表',
  check: '清单',
  code: '代码块',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
  h6: 'H6',
  number: '编号列表',
  paragraph: '常规',
  quote: '引用',
};

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

// 编程语言列表
function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
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

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'icon-juzhongduiqi',
    iconRTL: 'icon-juzhongduiqi',
    name: '中心对齐',
  },
  start: {
    icon: 'icon-zuoduiqi',
    iconRTL: 'icon-zuoduiqi',
    name: '开始对齐',
  },
  end: {
    icon: 'icon-zuoduiqi',
    iconRTL: 'icon-zuoduiqi',
    name: '尾部对齐',
  },
  justify: {
    icon: 'icon-zuoyouduiqi',
    iconRTL: 'icon-zuoyouduiqi',
    name: '两端对齐',
  },
  left: {
    icon: 'icon-zuoduiqi',
    iconRTL: 'icon-zuoduiqi',
    name: '左对齐',
  },
  right: {
    icon: 'icon-zuoduiqi',
    iconRTL: 'icon-zuoduiqi',
    name: '右对齐',
  }
};

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($INTERNAL_isPointSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {    
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($INTERNAL_isPointSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {      
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($INTERNAL_isPointSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if ($INTERNAL_isPointSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent);
          }
        }
      });
    }
  };
  
  const blockTypeToBlockFn: {[key:string]: any} = {
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
    h: {
      iconClass: '',
      fn: '',
      type: ''
    },
    number: {
      iconClass: 'icon-youxuliebiao icon-font opacity-75',
      fn: formatNumberedList,
      type: ''
    },
    paragraph: {
      iconClass: 'icon-paragraph icon-font opacity-75',
      fn: formatParagraph,
      type: ''
    },
    quote: {
      iconClass: 'icon-quote icon-font opacity-75',
      fn: formatQuote,
      type: ''
    }
  };

  const blockTypeToBlockTitles: {[key:string]: any} = {
    h1: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    },
    h2: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    },
    h3: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    },
    h4: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    },
    h5: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    },
    h6: {
      iconClass: '',
      fn: formatHeading,
      type: blockType
    }
  }

  const executeCommand = (fn: Function, type: string) => {
    if (typeof fn === 'function') {
        type=="" ? fn() : fn(type);
    }
  };
  
  const [open, setOpen] = React.useState(false);
  const iconTitle = useCallback(() => {
    let icon = null;
    let name = '';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(blockType as string)) {
      icon = blockType;
    } else {
      icon = <i className={classNames("iconfont fs-5", blockTypeToBlockFn[blockType].iconClass)}></i>
      name = blockTypeToBlockName[blockType];
    }
    return (
      <>
          {icon}<span>{name}</span><i className={classNames('iconfont', {'icon-xiangxia': !open}, {'icon-xiangshang': open})}></i>
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
          <Menu bordered style={{ minWidth: 120 }}>
            {Object.keys(blockTypeToBlockFn).map((item, idx) => {
              const active = blockType === item;
              if (item=='h') {
                return (
                  <Menu.SubMenu key={idx} iconClass="icon-zitibiaoti" text="标题" collapse={true} overlayProps={{isOpen:false}}>
                    {Object.keys(blockTypeToBlockTitles).map((key) => {
                      const value = blockTypeToBlockTitles[key];
                      return (
                        <Menu.Item 
                          key={key}
                          iconClass={value['iconClass']} 
                          active={active}
                          onClick={() => {executeCommand(value.fn, value.type); setOpen(false)}}
                          text={key} />
                      );
                    })}
                  </Menu.SubMenu>
                );
              } else {
                return (
                  <Menu.Item
                    key={idx}
                    active={active}
                    text={item}
                    iconClass={blockTypeToBlockFn[item].iconClass}
                    onClick={() => {executeCommand(blockTypeToBlockFn[item].fn, blockTypeToBlockFn[item].type); setOpen(false)}}
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

function FontDropDown({
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

  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($INTERNAL_isPointSelection(selection)) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const [open, setOpen] = React.useState(false);
  let labelName = style === 'font-family' ? '字体设置' : '字体大小';

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
        <div className='icon-font' title={style === 'font-family' ? '字体设置' : '字体大小'}>
          <i className={classNames('iconfont fs-5', {'icon-zitidaxiao1': style==='font-size', 'icon-bx-font-family': style==='font-family'})}></i>
          <span>{value ?? labelName}</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !open}, {'icon-xiangshang': open})}></i>
        </div>
      </Dropdown>
  );
}

function ElementFormatDropdown({
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

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();

  // React.useEffect(() => {
  //   const removeUpdateListener = editor.registerUpdateListener(
  //     ({ editorState }) => {
  //       editorState.read(() => {
  //         const htmlString = $generateHtmlFromNodes(editor, null);
  //         console.log(htmlString, "--html---");
          
  //         // Do something.
  //       });
  //     }
  //   );
  //   return () => {
  //     removeUpdateListener();
  //   };
  // }, [editor]);

  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>('root');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType('table');
      } else {
        setRootType('root');
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();          
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || 'left',
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const {code, ctrlKey, metaKey} = event;

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl('https://');
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($INTERNAL_isPointSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode;
            }

            if (textNode.__style !== '') {
              textNode.setStyle('');
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
            }
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({color: value});
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({'background-color': value});
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );

  // 编程语言列表
  const [openCodeLan, setOpenCodeLan] = React.useState<boolean>();
  const CodeLanguageList = useCallback((): JSX.Element => {
    return (
      <Dropdown
        disabled={!isEditable}
        trigger="click"
        onVisibleChange={(isOpen) => setOpenCodeLan(isOpen)}
        isOpen={openCodeLan}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120 }}>
              {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
                const active = value === codeLanguage;
                  return (
                    <Menu.Item
                      key={value}
                      active={active}
                      text={name}
                      iconClass=''
                      onClick={() => {onCodeLanguageSelect(value); setOpenCodeLan(false);}}
                    />
                  );
              })}
            </Menu>
          </div>
        }
      >
        <div className='icon-font'>
          <i className='iconfont icon-code fs-5'></i>
          <span>{getLanguageFriendlyName(codeLanguage)}</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !openCodeLan}, {'icon-xiangshang': openCodeLan})}></i>
        </div>
      </Dropdown>
    );
  }, [openCodeLan, onCodeLanguageSelect]);

  // 其他 删除线 下标 上标 删除格式
  const [otherOpen, setOtherOpen] = React.useState<boolean>();
  const OthersList = useCallback((): JSX.Element => {
    return (
      <Dropdown
        disabled={!isEditable}
        trigger="click"
        onVisibleChange={(isOpen) => setOtherOpen(isOpen)}
        isOpen={otherOpen}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120 }}>
              <Menu.Item
                  active={isStrikethrough}
                  text='删除线'
                  iconClass='icon-strikethrough'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'); setOtherOpen(false);}}
              />
              <Menu.Item
                  active={isSubscript}
                  text='下标'
                  iconClass='icon-subscript2'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'); setOtherOpen(false);}}
              />
              <Menu.Item
                  active={isSuperscript}
                  text='上标'
                  iconClass='icon-superscript2'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'); setOtherOpen(false);}}
              />
              <Menu.Item
                  text='清除格式'
                  iconClass='icon-qingchu'
                  onClick={() => {clearFormatting(); setOtherOpen(false);}}
              />
            </Menu>
          </div>
        }
      >
        <div className='icon-font'>
          <i className='iconfont icon-other fs-5'></i>
          <span>其他</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !otherOpen}, {'icon-xiangshang': otherOpen})}></i>
        </div>
      </Dropdown>
    );
  }, [otherOpen, clearFormatting]);

  // 插入 分割线 图片 gif 表格 列布局 公式 便签 折叠层 视频
  const [insertOpen, setInsertOpen] = React.useState<boolean>();
  const InsertList = useCallback((): JSX.Element => {
    return (
      <Dropdown
        disabled={!isEditable}
        trigger="click"
        onVisibleChange={(isOpen) => setInsertOpen(isOpen)}
        isOpen={insertOpen}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120 }}>
              <Menu.Item
                  text='分割线'
                  iconClass='icon-henggang'
                  onClick={() => {() => {activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);setInsertOpen(false);}}}
              />
              <Menu.Item
                  text='图片'
                  iconClass='icon-ic_image_upload'
                  onClick={() => {setInsertOpen(false); showModal('插入图片', (onClose) => (
                    <InsertImageDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ), 500);setInsertOpen(false)}}
              />
              <Menu.Item
                  text='行内图片'
                  iconClass='icon-ic_image_upload'
                  onClick={() => {setInsertOpen(false); showModal('插入图片', (onClose) => (
                    <InsertInlineImageDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ), 500);setInsertOpen(false)}}
              />
              <Menu.Item
                  text='表格'
                  iconClass='icon-table'
                  onClick={() => {setInsertOpen(false); showModal('插入表格', (onClose) => (
                    <InsertTableDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ));setInsertOpen(false)}}
              />
              <Menu.Item
                  text='列布局'
                  iconClass='icon-columns'
                  onClick={() => {setInsertOpen(false); showModal('插入多列', (onClose) => (
                    <InsertLayoutDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ));setInsertOpen(false)}}
              />
              <Menu.Item
                  text='视频iframe'
                  iconClass='icon-video2'
                  onClick={() => {setInsertOpen(false); showModal('插入视频地址', (onClose) => (
                    <InsertVideoIframeDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ), 500);setInsertOpen(false)}}
              />
            </Menu>
          </div>
        }
      >
        <div className='icon-font'>
          <i className='iconfont icon-card-insert fs-5'></i>
          <span>插入</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !insertOpen}, {'icon-xiangshang': insertOpen})}></i>
        </div>
      </Dropdown>
    );
  }, []);

  return (
    <>
    <div className="toolbar">
      <div className='overflow-x-auto d-inline-flex flex-nowrap flex-row align-content-center align-items-center'>
      <ToolIcon 
            click={() => {activeEditor.dispatchCommand(UNDO_COMMAND, undefined);}}
            iconName='icon-undo1'
            label='撤销'
            title={IS_APPLE ? '撤销 (⌘Z)' : '撤销 (Ctrl+Z)'}
            disabled={!canUndo || !isEditable}
      />
      <Divider />
      <ToolIcon 
            click={() => {activeEditor.dispatchCommand(REDO_COMMAND, undefined);}}
            iconName='icon-redo'
            label='重做'
            title={IS_APPLE ? '重做 (⌘Y)' : '重做 (Ctrl+Y)'}
            disabled={!canRedo || !isEditable}
      />
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
            <>
              <BlockFormatDropDown
                disabled={!isEditable}
                blockType={blockType}
                rootType={rootType}
                editor={editor}
              />
              <Divider />
            </>
      )}
      {/* 布局 */}
      <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={editor}
        isRTL={isRTL}
      />
      <Divider />
      {/* 编程语言列表 */}
      {blockType === 'code' ? (
        <>
          <CodeLanguageList />
          <Divider />
        </>
      ) : (
        // 代码文本块
        <>
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');}}
            iconName='icon-code1'
            active={isCode}
            label='文本块'
            title='文本块'
            disabled={!isEditable}
          />
          <Divider />
          <FontDropDown
            disabled={!isEditable}
            style={'font-family'}
            value={fontFamily}
            editor={editor}
          />
          <Divider />
          <FontDropDown
            disabled={!isEditable}
            style={'font-size'}
            value={fontSize}
            editor={editor}
          />
          <Divider />
          {/* 字体加粗 */}
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');}}
            iconName='icon-bold4'
            active={isBold}
            label='加粗'
            title={IS_APPLE ? '加粗 (⌘B)' : '加粗 (Ctrl+B)'}
            disabled={!isEditable}
          />
          <Divider />
          {/* 斜体 */}
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');}}
            iconName='icon-italic'
            active={isItalic}
            label='斜体'
            title={IS_APPLE ? '斜体 (⌘I)' : '斜体 (Ctrl+I)'}
            disabled={!isEditable}
          />
          <Divider />
          {/* 下划线 */}
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');}}
            iconName='icon-zitixiahuaxian'
            active={isUnderline}
            label='下划线'
            title={IS_APPLE ? '下划线 (⌘U)' : '下划线 (Ctrl+U)'}
            disabled={!isEditable}
          />
          <Divider />
          {/* 链接 */}
          <ToolIcon 
            click={insertLink}
            iconName='icon-charulianjie'
            active={isLink}
            label='链接'
            title='链接'
            disabled={!isEditable}
          />
          <Divider />
          {/* 字体颜色 */}
          <DropdownColorPicker
            disabled={!isEditable}
            color={fontColor}
            type='fontColor'
            onChange={onFontColorSelect}
            title="字色"
          />
          <Divider />
          {/* 背景颜色 */}
          <DropdownColorPicker
            disabled={!isEditable}
            color={bgColor}
            type='bgColor'
            onChange={onBgColorSelect}
            title="背景色"
          />
          <Divider />
          <OthersList />
          <Divider />
          {/* 插入图片等 */}
          <InsertList />
        </>
      )}
      </div>
      {/* 弹出框 */}
      {modal}
    </div>
    </>
  );
}
