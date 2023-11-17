import React from 'react';
import classNames from 'classnames';
import { 
    EditorState,
    ContentBlock,
    Entity
} from 'draft-js'
import PopoverComp from '@/components/popover/popover';
import { insertText } from '../../utils/content';
import './index.css'

const emojis = [
    '🤣',
    '🙌',
    '💚',
    '💛',
    '👏',
    '😉',
    '💯',
    '💕',
    '💞',
    '💘',
    '💙',
    '💝',
    '🖤',
    '💜',
    '❤️',
    '😍',
    '😻',
    '💓',
    '💗',
    '😋',
    '😇',
    '😂',
    '😹',
    '😘',
    '💖',
    '😁',
    '😀',
    '🤞',
    '😲',
    '😄',
    '😊',
    '👍',
    '😌',
    '😃',
    '😅',
    '✌️',
    '🤗',
    '💋',
    '😗',
    '😽',
    '😚',
    '🤠',
    '😙',
    '😺',
    '👄',
    '😸',
    '😏',
    '😼',
    '👌',
    '😎',
    '😆',
    '😛',
    '🙏',
    '🤝',
    '🙂',
    '🤑',
    '😝',
    '😐',
    '😑',
    '🤤',
    '😤',
    '🙃',
    '🤡',
    '😶',
    '😪',
    '😴',
    '😵',
    '😓',
    '👊',
    '😦',
    '😷',
    '🤐',
    '😜',
    '🤓',
    '👻',
    '😥',
    '🙄',
    '🤔',
    '🤒',
    '🙁',
    '😔',
    '😯',
    '☹️',
    '☠️',
    '😰',
    '😩',
    '😖',
    '😕',
    '😒',
    '😣',
    '😢',
    '😮',
    '😿',
    '🤧',
    '😫',
    '🤥',
    '😞',
    '😬',
    '👎',
    '💀',
    '😳',
    '😨',
    '🤕',
    '🤢',
    '😱',
    '😭',
    '😠',
    '😈',
    '😧',
    '💔',
    '😟',
    '🙀',
    '💩',
    '👿',
    '😡',
    '😾',
    '🖕',
];

export interface EmojiToolBarProps {
    onChange: Function;
    editorState: EditorState;
    classNames?: string;
    onClick?: () => void;
    requestFocus?: Function;
}
const EmojiToolBar = (props: EmojiToolBarProps) => {

    const insertEmoji = (event: React.MouseEvent<HTMLSpanElement>, emoji: string) => {
        event.preventDefault();
        props.onChange(insertText(props.editorState, emoji));
        props.requestFocus && props.requestFocus();
    }

    const content = (
        <div className=''>
            <ul className="richEditor-emojis">
                {emojis.map((item) => {
                    return (
                        <li
                            key={item}
                            onClick={(event) => insertEmoji(event, item)}
                        >
                            {item}
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <PopoverComp trigger="click" placement="bottom" content={content} usePortal={false}>
            <span className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <i className='iconfont icon-biaoqing fs-4 text-black-50'></i>
            </span>
        </PopoverComp>
    );
}
export default EmojiToolBar; 