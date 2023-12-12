import React, { ReactElement } from 'react';
import { EditorState } from "draft-js";
import classNames from 'classnames';
import punycode from 'punycode';

const cssStr = `
.counter {
    color: inherit;
}
.counterOverLimit {
    color: #d86262;
}
`
interface WordCounterParams {
    editorState: EditorState;
    className?: string;
    limit?: number;
}
export const WordCounter = ({
    editorState,
    limit,
    className,
}: WordCounterParams): ReactElement => {
    const getWordCount = (editorState: EditorState): number => {
        const plainText = editorState.getCurrentContent().getPlainText('');
        const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
        const cleanString = plainText.replace(regex, ' ').trim(); // replace above characters w/ space
        const wordArray = cleanString.match(/\S+/g); // matches words according to whitespace
        return wordArray ? wordArray.length : 0;
    };

    const getClassNames = (count: number): string => {
        const defaultStyle = classNames('counter', className);
        const overLimitStyle = classNames('counterOverLimit', className);
        return count > limit! ? overLimitStyle : defaultStyle;
    };

    const count = getWordCount(editorState);
    const cls = getClassNames(count);
    return (
        <>
            <style jsx>{cssStr}</style>
            <span className={cls}>{count}</span>
        </>
    );    
}

interface LineCounterParams {
    editorState: EditorState;
    limit?: number;
    className?: string;
}
export const LineCounter = ({
    editorState,
    limit,
    className,
  }: LineCounterParams): ReactElement => {
    const getLineCount = (editorState: EditorState): number | null => {
        const blockArray = editorState.getCurrentContent().getBlocksAsArray();
        return blockArray ? blockArray.length : null;
    };
    
    const getClassNames = (count: number | null): string => {
        const defaultStyle = classNames('counter', className);
        const overLimitStyle = classNames('counterOverLimit', className);
        return count! > limit! ? overLimitStyle : defaultStyle;
    };
    
    const count = getLineCount(editorState);
    const cls = getClassNames(count);
    
    return (
        <>
            <style jsx>{cssStr}</style>
            <span className={cls}>{count}</span>
        </>
    );
}

interface CharCounterProps {
    editorState: EditorState;
    className?: string;
    limit?: number;
}
export const CharCounter = ({
    className,
    editorState,
    limit,
}: CharCounterProps): ReactElement => {
    const getCharCount = (editorState: EditorState): number => {
      const decodeUnicode = (str: string): number[] => punycode.ucs2.decode(str); // func to handle unicode characters
      const plainText = editorState.getCurrentContent().getPlainText('');
      const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
      const cleanString = plainText.replace(regex, '').trim(); // replace above characters w/ nothing
      return decodeUnicode(cleanString).length;
    };
  
    const getClassNames = (count: number): string => {
      const defaultStyle = classNames('counter', className);
      const overLimitStyle = classNames('counterOverLimit', className);
      return count > limit! ? overLimitStyle : defaultStyle;
    };
  
    const count = getCharCount(editorState);
    const cls = getClassNames(count);
  
    return (
        <>
            <style jsx>{cssStr}</style>
            <span className={cls}>{count}</span>
        </>
    );
};