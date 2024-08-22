/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorThemeClasses} from 'lexical';

import './CmsEditorTheme.css';

const theme: EditorThemeClasses = {
  blockCursor: 'CmsEditorTheme__blockCursor',
  characterLimit: 'CmsEditorTheme__characterLimit',
  code: 'CmsEditorTheme__code',
  codeHighlight: {
    atrule: 'CmsEditorTheme__tokenAttr',
    attr: 'CmsEditorTheme__tokenAttr',
    boolean: 'CmsEditorTheme__tokenProperty',
    builtin: 'CmsEditorTheme__tokenSelector',
    cdata: 'CmsEditorTheme__tokenComment',
    char: 'CmsEditorTheme__tokenSelector',
    class: 'CmsEditorTheme__tokenFunction',
    'class-name': 'CmsEditorTheme__tokenFunction',
    comment: 'CmsEditorTheme__tokenComment',
    constant: 'CmsEditorTheme__tokenProperty',
    deleted: 'CmsEditorTheme__tokenProperty',
    doctype: 'CmsEditorTheme__tokenComment',
    entity: 'CmsEditorTheme__tokenOperator',
    function: 'CmsEditorTheme__tokenFunction',
    important: 'CmsEditorTheme__tokenVariable',
    inserted: 'CmsEditorTheme__tokenSelector',
    keyword: 'CmsEditorTheme__tokenAttr',
    namespace: 'CmsEditorTheme__tokenVariable',
    number: 'CmsEditorTheme__tokenProperty',
    operator: 'CmsEditorTheme__tokenOperator',
    prolog: 'CmsEditorTheme__tokenComment',
    property: 'CmsEditorTheme__tokenProperty',
    punctuation: 'CmsEditorTheme__tokenPunctuation',
    regex: 'CmsEditorTheme__tokenVariable',
    selector: 'CmsEditorTheme__tokenSelector',
    string: 'CmsEditorTheme__tokenSelector',
    symbol: 'CmsEditorTheme__tokenProperty',
    tag: 'CmsEditorTheme__tokenProperty',
    url: 'CmsEditorTheme__tokenOperator',
    variable: 'CmsEditorTheme__tokenVariable',
  },
  embedBlock: {
    base: 'CmsEditorTheme__embedBlock',
    focus: 'CmsEditorTheme__embedBlockFocus',
  },
  hashtag: 'CmsEditorTheme__hashtag',
  heading: {
    h1: 'CmsEditorTheme__h1',
    h2: 'CmsEditorTheme__h2',
    h3: 'CmsEditorTheme__h3',
    h4: 'CmsEditorTheme__h4',
    h5: 'CmsEditorTheme__h5',
    h6: 'CmsEditorTheme__h6',
  },
  image: 'editor-image',
  indent: 'CmsEditorTheme__indent',
  inlineImage: 'inline-editor-image',
  layoutContainer: 'CmsEditorTheme__layoutContaner',
  layoutItem: 'CmsEditorTheme__layoutItem',
  link: 'CmsEditorTheme__link',
  list: {
    listitem: 'CmsEditorTheme__listItem',
    listitemChecked: 'CmsEditorTheme__listItemChecked',
    listitemUnchecked: 'CmsEditorTheme__listItemUnchecked',
    nested: {
      listitem: 'CmsEditorTheme__nestedListItem',
    },
    olDepth: [
      'CmsEditorTheme__ol1',
      'CmsEditorTheme__ol2',
      'CmsEditorTheme__ol3',
      'CmsEditorTheme__ol4',
      'CmsEditorTheme__ol5',
    ],
    ul: 'CmsEditorTheme__ul',
  },
  ltr: 'CmsEditorTheme__ltr',
  mark: 'CmsEditorTheme__mark',
  markOverlap: 'CmsEditorTheme__markOverlap',
  paragraph: 'CmsEditorTheme__paragraph',
  quote: 'CmsEditorTheme__quote',
  rtl: 'CmsEditorTheme__rtl',
  table: 'CmsEditorTheme__table',
  tableAddColumns: 'CmsEditorTheme__tableAddColumns',
  tableAddRows: 'CmsEditorTheme__tableAddRows',
  tableCell: 'CmsEditorTheme__tableCell',
  tableCellActionButton: 'CmsEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer:
    'CmsEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'CmsEditorTheme__tableCellEditing',
  tableCellHeader: 'CmsEditorTheme__tableCellHeader',
  tableCellPrimarySelected: 'CmsEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'CmsEditorTheme__tableCellResizer',
  tableCellSelected: 'CmsEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'CmsEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'CmsEditorTheme__tableCellResizeRuler',
  tableSelected: 'CmsEditorTheme__tableSelected',
  tableSelection: 'CmsEditorTheme__tableSelection',
  text: {
    bold: 'CmsEditorTheme__textBold',
    code: 'CmsEditorTheme__textCode',
    italic: 'CmsEditorTheme__textItalic',
    strikethrough: 'CmsEditorTheme__textStrikethrough',
    subscript: 'CmsEditorTheme__textSubscript',
    superscript: 'CmsEditorTheme__textSuperscript',
    underline: 'CmsEditorTheme__textUnderline',
    underlineStrikethrough: 'CmsEditorTheme__textUnderlineStrikethrough',
  },
};

export default theme;
