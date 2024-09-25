/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css'
import { $createMentionNode } from '../../nodes/MentionNode';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/lib/constant/queryKey';
import { IUserByNameReq, IUserList, IData, IUser } from '@/interfaces';
import { searchUserList } from '@/services/api';
import { isNullOrUnDef } from '@/lib/is';
import LoaderComp from '@/components/loader/loader';
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
  '[' +
  TRIGGERS +
  ']' +
  '((?:' +
  VALID_CHARS +
  VALID_JOINS +
  '){0,' +
  LENGTH_LIMIT +
  '})' +
  ')$',
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
  '[' +
  TRIGGERS +
  ']' +
  '((?:' +
  VALID_CHARS +
  '){0,' +
  ALIAS_LENGTH_LIMIT +
  '})' +
  ')$',
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const mentionsCache = new Map();

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 1);
}

class MentionTypeaheadOption extends MenuOption {
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  let className = 'item';
  if (isSelected) {
    className += ' selected';
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      {option.picture}
      <span className="text">{option.name}</span>
    </li>
  );
}

export default function NewMentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<Array<string>>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  // 用户请求
  const getUserListQuery = useQuery({
    queryKey: [QUERY_KEY.SEARCH_USER_NAMES, queryString, page],
    queryFn: async () => {
      const data = {name: queryString} as IUserByNameReq;
      const res = (await searchUserList({data: data})) as IData<IUserList>; 
      console.log(res)     
      if (res.status===200) {
        return res.data;
      } else {
        return [];
      }
    },
    enabled: isFetching,
    refetchOnMount: false,
  });

  useEffect(() => {
    const cachedResults = mentionsCache.get(queryString);

    if (queryString == null) {
      setResults([]);
      return;
    }

    setIsFetching(true);

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    const datas = getUserListQuery.data as IUserList;
    if (!isNullOrUnDef(datas)) {
      if (datas['userList'].length>0) {
        startTransition(() => {
          const users = datas['userList'].map((item: IUser): string => {
            return item['nickname'];
          });
          mentionsCache.set(queryString, users);
          setResults(users);
          setHasNextPage(datas.hasNextPage!);
        });
      } else {
        mentionsCache.set(queryString, null);
      }
    }
    setLoading(false);
  }, [queryString, getUserListQuery.data]);

  // 上拉加载更多
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: () => {setIsFetching(true); console.log(2223);setPage(prev=>prev+1);},
    disabled: Boolean(error),
    rootMargin: '0px 0px 400px 0px',
  });

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            new MentionTypeaheadOption(result, <i className="icon iconfont icon-gerenzhongxin"/>),
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode("@"+selectedOption.name+" ");
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
            <div className="typeahead-popover mentions-menu">
              <LoaderComp className="w-100" loading={!getUserListQuery.isSuccess || loading || isPending} >
                  <ul>
                  {options.map((option, i: number) => (
                    <MentionsTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                  </ul>
              </LoaderComp>
              {hasNextPage && (getUserListQuery.isSuccess && (
                  <ul ref={infiniteRef}>
                      <li className='loading'>{true ? "loading..." : ""}</li>
                  </ul>
              ))}
            </div>,
            anchorElementRef.current,
          )
          : null
      }
    />
  );
}
