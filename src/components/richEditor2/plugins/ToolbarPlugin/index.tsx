/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {
  $isListNode,
  ListNode
} from '@lexical/list';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$isDecoratorBlockNode} from '@lexical/react/LexicalDecoratorBlockNode';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $isHeadingNode,
  $isQuoteNode
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText
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
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical';
import React, {Dispatch, useCallback, useEffect, useState} from 'react';
import {IS_APPLE} from '../../shared/environment';

import classNames from 'classnames';
import Dropdown from '@/components/dropdown';
import Menu from '@/components/menu/Menu';

import useModal from '@/hooks/useModal/show';
// import catTypingGif from '../../images/cat-typing.gif';
// import {$createStickyNode} from '../../nodes/StickyNode';
// import DropDown, {DropDownItem} from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {sanitizeUrl} from '../../utils/url';
// import {EmbedConfigs} from '../AutoEmbedPlugin';
// import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
import {InsertEquationDialog} from '../EquationsPlugin';
import {INSERT_EXCALIDRAW_COMMAND} from '../ExcalidrawPlugin';
import {InsertImageDialog} from '../ImagesPlugin';
import {InsertInlineImageDialog} from '../InlineImagePlugin';
import {InsertTableDialog} from '../TablePlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import InsertVideoIframeDialog from '../VideoIframePlugin/InsertVideoIframeDialog';
import { useTranslations } from 'next-intl';
import getCodeLanguageOptions from './language';
import { rootTypeToRootName, blockTypeToBlockNameType, FUNC_BLOCK_TYPE_TO_BLOCKNAME } from './formatBlock';
import BlockFormatDropDown from './formatBlock';
import ElementFormatDropdown from './formatAlign';
import FontDropDown from './font';


const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

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


export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<blockTypeToBlockNameType>('paragraph');
  const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>('root');
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
  const blockTypeToBlockName = FUNC_BLOCK_TYPE_TO_BLOCKNAME();

  const t = useTranslations('ArticleEditPage');

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
            setBlockType(type as blockTypeToBlockNameType);
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
        if (selection !== null) {
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
                  text={t('strikethrough')} //'删除线'
                  iconClass='icon-strikethrough'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'); setOtherOpen(false);}}
              />
              <Menu.Item
                  active={isSubscript}
                  text={t('subscript')} //'下标'
                  iconClass='icon-subscript2'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'); setOtherOpen(false);}}
              />
              <Menu.Item
                  active={isSuperscript}
                  text={t('superscript')} //'上标'
                  iconClass='icon-superscript2'
                  onClick={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'); setOtherOpen(false);}}
              />
              <Menu.Item
                  text={t('clearFormat')} //'清除格式'
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

  // 插入 分割线 图片 gif 表格 列布局 公式 便签 折叠层 视频 公式 流程图
  const [insertOpen, setInsertOpen] = React.useState<boolean>();
  const InsertList = useCallback((): JSX.Element => {
    return (
      <Dropdown
        disabled={!isEditable}
        trigger="click"
        onVisibleChange={(isOpen) => {setInsertOpen(isOpen);}}
        isOpen={insertOpen}
        menu={
          <div>
            <Menu bordered style={{ minWidth: 120 }}>
              <Menu.Item
                  text={t('divider')} //'分割线'
                  iconClass='icon-henggang'
                  onClick={() => {() => {activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);setInsertOpen(false);}}}
              />
              <Menu.Item
                  text={t('image')} //'图片'
                  iconClass='icon-ic_image_upload'
                  onClick={() => {
                    setInsertOpen(false);
                    showModal(t('insertImage'), (onClose) => (
                      <InsertImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                        height={300}
                        resizable={true}
                      />
                    ), 810, 'zIndex');
                  }}
              />
              <Menu.Item
                  text={t('inlineImage')} //'行内图片'
                  iconClass='icon-ic_image_upload'
                  onClick={() => {
                    setInsertOpen(false); 
                    showModal(t('insertInlineImage'), (onClose) => (
                      <InsertInlineImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ), 500);
                  }}
              />
              <Menu.Item
                  text={t('table')} //'表格'
                  iconClass='icon-table'
                  onClick={() => {
                    setInsertOpen(false); 
                    showModal(t('insertTable'), (onClose) => (
                      <InsertTableDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
              />
              <Menu.Item
                  text={t('columns')} //'列布局'
                  iconClass='icon-columns'
                  onClick={() => {setInsertOpen(false); 
                    showModal(t('insertColumns'), (onClose) => (
                      <InsertLayoutDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
              />
              <Menu.Item
                  text={t('videoIframe')} //'视频iframe'
                  iconClass='icon-video2'
                  onClick={() => {setInsertOpen(false); 
                    showModal(t('insertVideoIframe'), (onClose) => (
                      <InsertVideoIframeDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ), 500);
                  }}
              />
              <Menu.Item
                  text={t('equation')} //'公式'
                  iconClass='icon-formula'
                  onClick={() => {
                    setInsertOpen(false);
                    showModal(t('insertEquation'), (onClose) => (
                      <InsertEquationDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ), 500);
                  }}
              />
              <Menu.Item
                  text={t('excalidraw')} //流程图
                  iconClass='icon-flowChart'
                  onClick={() => {
                    setInsertOpen(false); 
                    activeEditor.dispatchCommand(
                      INSERT_EXCALIDRAW_COMMAND,
                      undefined,
                    );
                  }}
              />
            </Menu>
          </div>
        }
      >
        <div className='icon-font'>
          <i className='iconfont icon-card-insert fs-5'></i>
          <span>{t('insert')}</span>
          <i className={classNames('iconfont', {'icon-xiangxia': !insertOpen}, {'icon-xiangshang': insertOpen})}></i>
        </div>
      </Dropdown>
    );
  }, [insertOpen]);

  return (
    <>
    <div className="toolbar">
      <div className='overflow-x-auto d-inline-flex flex-nowrap flex-row align-content-center align-items-center'>
      <ToolIcon 
            click={() => {activeEditor.dispatchCommand(UNDO_COMMAND, undefined);}}
            iconName='icon-undo1'
            label={t('undo')} //'撤销'
            title={IS_APPLE ? t('undo4Mac') : t('undo4Win')}
            disabled={!canUndo || !isEditable}
      />
      <Divider />
      <ToolIcon 
            click={() => {activeEditor.dispatchCommand(REDO_COMMAND, undefined);}}
            iconName='icon-redo'
            label={t('redo')} //'重做'
            title={IS_APPLE ? t('redo4Mac') : t('redo4Win')}
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
            label={t('textBlock')} //'文本块'
            title='Insert code block'
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
            label={t('bold')} //'加粗'
            title={IS_APPLE ? t('bold4Mac') : t('bold4Win')}
            disabled={!isEditable}
          />
          <Divider />
          {/* 斜体 */}
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');}}
            iconName='icon-italic'
            active={isItalic}
            label={t('italic')} //'斜体'
            title={IS_APPLE ? '斜体 (⌘I)' : '斜体 (Ctrl+I)'}
            disabled={!isEditable}
          />
          <Divider />
          {/* 下划线 */}
          <ToolIcon 
            click={() => {activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');}}
            iconName='icon-zitixiahuaxian'
            active={isUnderline}
            label={t('underline')} //'下划线'
            title={IS_APPLE ? '下划线 (⌘U)' : '下划线 (Ctrl+U)'}
            disabled={!isEditable}
          />
          <Divider />
          {/* 链接 */}
          <ToolIcon 
            click={insertLink}
            iconName='icon-charulianjie'
            active={isLink}
            label={t('link')} //'链接'
            title={t('link')} //'链接'
            disabled={!isEditable}
          />
          <Divider />
          {/* 字体颜色 */}
          <DropdownColorPicker
            disabled={!isEditable}
            color={fontColor}
            type='fontColor'
            onChange={onFontColorSelect}
            title={t('fontColor')} //"字色"
          />
          <Divider />
          {/* 背景颜色 */}
          <DropdownColorPicker
            disabled={!isEditable}
            color={bgColor}
            type='bgColor'
            onChange={onBgColorSelect}
            title={t('bgColor')} //"背景色"
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