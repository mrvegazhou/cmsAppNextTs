'use client';
import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation } from '@tanstack/react-query';
import { useRecoilState } from "recoil";
import type { TBody } from '@/types';
import type { IData } from '@/interfaces';
import { getTagList } from "@/services/api";
import { ITag } from "@/interfaces";
import Menu from '@/components/menu/Menu';
import { debounce } from "lodash"
import { writeArticleContext } from "@/store/articleData";
import "./index.scss"

const ArticleTag = (props: {init: boolean}) => {

    const inputRef = useRef(null);

    const [articleData, setArticleData] = useRecoilState(writeArticleContext);

    let [tagList, setTagList] = useState<ITag[]>([]);
    let [tags, setTags] = useState<ITag[]>([]);
    let [showSearchTags, setShowSearchTags] = useState(true);

    // 获取文章类型列表
    const getAppTagListMutation = useMutation(
        async (variables: TBody<{ name: string }>) => {
            return (await getTagList(variables)) as IData<{ tagList: ITag[] }>;
        },
    );
    
    const debouncedSearch = debounce(async (name) => {
        await getAppTagListMutation.mutateAsync({
            data: {
                name: name
            }
        }).then(res => {
            if (res.status == 200) {
                if (res.data.tagList.length>0) {
                    let list = (res.data.tagList).map((tag, i) => {
                        return {id: tag.id, name: tag.name}
                    });
                    setTagList([...list]);
                }
            }
        });
    }, 300);

    const searchTagList = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value == "") {
            return;
        }
        debouncedSearch((e.target.value).trim());
    };

    const removeTagMenu = useCallback(() => {
        setShowSearchTags(false);
    }, []);

    // 删除已经勾选的tag
    const removeTagName = useCallback((id: number) => {
        setTags(pre => pre.filter((item, _) => item.id != id));
        setArticleData(pre => {
            return {...pre, ...{tags: articleData.tags.filter((tag) => tag.id !== id)}}
        });
        if (tags.length<3) setShowSearchTags(true); 
    }, [tags]);

    const addTagName = useCallback((item: ITag) => {
        if (tags.find(_item => _item.id === item.id)) {
            return;
        }
        if (tags.length>=3) {
            setShowSearchTags(false);
            return;
        };
        setTags(i => [...i, { id: item.id, name: item.name }]);
        setArticleData(pre => {
            return {...pre, ...{tags: [...articleData.tags, { id: item.id, name: item.name }]}}
        });
        setTagList([]);
        if (inputRef)
            // @ts-ignore
            inputRef.current.value = "";
    }, [tags]);

    const ArticleTagMenus = useCallback((): JSX.Element => {
        if (getAppTagListMutation.isLoading) {
            return (<div className="position-absolute" style={{ top: "35px" }}>
                        <Menu bordered style={{ maxWidth: 200, maxHeight: 250, overflow: 'auto' }}>
                            <Menu.Item text="请求数据中..." ></Menu.Item>
                        </Menu>
                    </div>);
        } else if (tagList.length>0) {
            return (<div className="position-absolute" style={{ top: "35px" }}>
                <Menu bordered style={{ maxWidth: 200, maxHeight: 250, overflow: 'auto' }}>
                    {tagList.map((item, idx) => {
                        if (tags.find((_item)=>{return _item.id == item.id;})) {
                            return <Menu.Item key={idx} text={item.name} className="cursor-not-allowed bg-light" />;
                        } else {
                            return <Menu.Item key={idx} text={item.name} onClick={() => { addTagName(item);}} />;
                        }
                    })}
                </Menu>
            </div>);
        } else {
            return <></>;
        }
    }, [tagList]);

    const addTagInput = () => {
        if (tags.length>=3) {
            setShowSearchTags(false);
        } else {
            setShowSearchTags(true);
        }
        setTagList([]);
    };

    // const resetList = useResetRecoilState(writeArticleContext);
    useEffect(() => {
        // 初始化
        if (props.init) {
            let tmpTags = articleData.tags;
            setTags([...tmpTags]);
        }
    }, []);

    useEffect(() => {
        if (tags.length>=3) {
            setShowSearchTags(false);
        } else {
            setShowSearchTags(true);
        }
    }, [tags]);


    return (
        <>
            {tags.map((tag, i) => {
                return (<div className="article-tag-label mb-1" key={i}>
                            <div className="article-tag-name">{tag.name}</div>
                            <div className="article-tag-btn" onClick={() => removeTagName(tag.id)}>
                                <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                </div>)
            })}
            {showSearchTags && (
                <div className="article-tag-input mb-1">
                    <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor" className="ms-1">
                        <path fillRule="evenodd" d="M11.8 2.425a9.075 9.075 0 1 0 5.62 16.201l2.783 2.783a.875.875 0 1 0 1.238-1.237l-2.758-2.758A9.075 9.075 0 0 0 11.8 2.425ZM4.475 11.5a7.325 7.325 0 1 1 14.65 0 7.325 7.325 0 0 1-14.65 0Z" clipRule="evenodd"></path>
                    </svg>
                    <div className="d-flex flex-column position-relative">
                        <input className="" placeholder="搜索话题..." onChange={(e) => searchTagList(e)} ref={inputRef} />
                        <ArticleTagMenus />
                    </div>
                    <div className="article-tag-input-btn" onClick={() => removeTagMenu()}>
                        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                </div>)
            }
            {((tags.length==2 && !showSearchTags) || tags.length<2) &&
            (<div className="article-tag-add fs-6 text-muted mb-1" onClick={addTagInput}>
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