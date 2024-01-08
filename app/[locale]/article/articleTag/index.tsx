'use client';

import { useState, useCallback } from "react";
import { useMutation } from '@tanstack/react-query';
import type { TBody } from '@/types';
import type { IData } from '@/interfaces';
import { getTagList } from "@/services/api";
import { ITag } from "@/interfaces";
import Menu from '@/components/menu/Menu';
import { debounce } from "lodash"
import { useMap } from 'ahooks';
import "./index.scss"

const ArticleTag = (props: {}) => {

    let [tagList, setTagList] = useState<ITag[]>([]);
    let [tagNums, setTagNums] = useState(0);
    // 展示类别的列表
    const [showTagList, { set, setAll, remove, reset, get }] = useMap<number, ITag[]>([]);

    // 获取文章类型列表
    const getAppTagListMutation = useMutation(
        async (variables: TBody<{ name: string }>) => {
            return (await getTagList(variables)) as IData<{ tagList: ITag[] }>;
        },
    );

    const debouncedSearch = debounce(async (name, num) => {
        await getAppTagListMutation.mutateAsync({
            data: {
                name: name
            }
        }).then(res => {
            if (res.status == 200) {
                if (res.data.tagList.length>0) {
                    set(num, res.data.tagList);
                }
            }
        });
    }, 300);

    const searchTagList = async (e: React.ChangeEvent<HTMLInputElement>, num: number) => {
        if (e.target.value == "") {
            remove(num);
            return;
        }
        debouncedSearch(e.target.value, num);
    };

    const removeTagMenu = useCallback((num: number) => {
        setTagNums(prev => {
            if (prev < 0) {
                return 0;
            }
            return prev - 1;
        });
        remove(num);
    }, []);

    // 删除已经勾选的tag
    const removeTagName = useCallback((name: string) => {
        let filterTagList = tagList.filter((item, idx) => item.name != name);
        setTagList(filterTagList);
        setTagNums(prev => {
            if (prev < 0) {
                return 0;
            }
            return prev - 1;
        });
    }, [tagList]);


    let ArticleTagMenusList = useCallback(() => {
        return Array.from(Array(tagNums), (e, i) => {
            return (
                <div key={i}>
                    {tagList[i] ?
                        (<div className="article-tag-label">
                            <div className="article-tag-name">{tagList[i].name}</div>
                            <div className="article-tag-btn" onClick={() => removeTagName(tagList[i].name)}>
                                <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>)
                        : (
                            <div className="article-tag-input">
                                <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor" className="ms-1">
                                    <path fillRule="evenodd" d="M11.8 2.425a9.075 9.075 0 1 0 5.62 16.201l2.783 2.783a.875.875 0 1 0 1.238-1.237l-2.758-2.758A9.075 9.075 0 0 0 11.8 2.425ZM4.475 11.5a7.325 7.325 0 1 1 14.65 0 7.325 7.325 0 0 1-14.65 0Z" clipRule="evenodd"></path>
                                </svg>
                                <div className="d-flex flex-column position-relative">
                                    <input className="" placeholder="搜索话题..." onChange={(e) => searchTagList(e, i)} />
                                    <ArticleTagMenus num={i} />
                                </div>
                                <div className="article-tag-input-btn" onClick={() => removeTagMenu(i)}>
                                    <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>)
                    }
                </div>
            );
        })
    }, [tagNums]);

    const addTagName = useCallback((item: ITag, num: number) => {
        setTagList(pre => {
            pre.push({ id: item.id, name: item.name })
            return pre;
        });
        remove(num);
    }, [tagList]);

    const ArticleTagMenus = useCallback((prop: { num: number }): JSX.Element => {
        if (getAppTagListMutation.isLoading || !get(prop.num)) {
            return <></>;
        }
        let tmp = get(prop.num) ?? [];
        return (<div className="position-absolute" style={{ top: "35px" }} key={prop.num}>
            <Menu bordered style={{ maxWidth: 200, maxHeight: 250, overflow: 'auto' }}>
                {tmp.map((item, idx) => {
                    return <Menu.Item key={idx} text={item.name} onClick={() => { addTagName(item, prop.num); }} />;
                })}
            </Menu>
        </div>);
    }, [showTagList]);

    const addTagInput = () => {
        setTagNums(prev => prev + 1);
    };

    return (
        <>
            <ArticleTagMenusList />
            {tagNums<3 &&
            (<div className="article-tag-add fs-6 text-muted" onClick={addTagInput}>
                <svg width="14px" height="14px" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M13.25 3.25a1.25 1.25 0 1 0-2.5 0v7.5h-7.5a1.25 1.25 0 1 0 0 2.5h7.5v7.5a1.25 1.25 0 1 0 2.5 0v-7.5h7.5a1.25 1.25 0 0 0 0-2.5h-7.5v-7.5Z" clipRule="evenodd"></path>
                </svg>
                添加标签
            </div>
            )}
        </>
    );
};

export default ArticleTag;