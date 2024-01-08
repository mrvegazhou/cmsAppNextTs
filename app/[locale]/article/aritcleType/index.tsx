'use client';
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useRecoilState } from "recoil";
import type { IData, IType } from '@/interfaces';
import { getTypeList, getTypeListByPid, getTypeInfoById, getTypeListQueryConf } from "@/services/api";
import SearchSelect, { SearchSelectOptionData } from "@/components/searchSelect";
import { writeArticleContext } from "@/store/articleData";

const queryKey = 'typeList';
const queryKey2 = 'typeList2';

const ArticleType = (props: {}) => {

    const [articleData, setArticleData] = useRecoilState(writeArticleContext);

    const [value, setValue] = useState<number>(0);

    // 获取类型列表
    const getAppTypeListQuery = useQuery(
        [queryKey],
        async () => {
            let res = (await getTypeList({data: {name: ''}})) as IData<{ typeList: IType[] }>;
            if (res.status==200) {
                let listRes = res.data.typeList.map((item, _) => {
                    return {label: item.name, value: item.id};
                });
                return listRes as SearchSelectOptionData[];
            }
            return [];
        },
        getTypeListQueryConf,
    );

    const [option, setOption] = useState<Array<SearchSelectOptionData>>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (getAppTypeListQuery.isLoading) {
            setLoading(true);
            setOption([]);
        } else {
            setLoading(false);
            setOption(getAppTypeListQuery.data as SearchSelectOptionData[]);
        }
    }, [getAppTypeListQuery.isLoading]);

    const handleSearch = (e: string) => {
        setLoading(true);
        setTimeout(() =>  {
            if (getAppTypeListQuery.isLoading) {
                setLoading(true);
            } else {
                let data = getAppTypeListQuery.isError ? [] : getAppTypeListQuery.data;
                const filterOpion= data!.filter((item)=>!!item.label.includes(e.trim()));
                setOption([...filterOpion]);
                setLoading(false);
            }
        }, 500);
    };

    // 二级类别
    const getSecondTypeListQuery = useQuery(
        [queryKey2, value],
        async () => {
            if (value<=0) {
                return [];
            }
            let res = (await getTypeListByPid({data: {pid: value}})) as IData<{ typeList: IType[] }>;
            if (res.status==200) {
                let listRes = res.data.typeList.map((item, _) => {
                    return {label: item.name, value: item.id};
                });
                return listRes as SearchSelectOptionData[];
            }
            return [];
        },
        {...getTypeListQueryConf, ...{ keepPreviousData : true }}
    )
    const [secondOption, setSecondOption] = useState<Array<SearchSelectOptionData>>([]);
    const handleSecondSearch = (name: string) => {
        setTimeout(() =>  {
            if (getSecondTypeListQuery.isLoading) {
                setLoading(true);
            } else {
                let data = getSecondTypeListQuery.isError ? [] : getSecondTypeListQuery.data;
                const filterOpion= data.filter((item)=>!!item.label.includes(name.trim()))
                setSecondOption([...filterOpion]);
            }
        }, 500);
    }

    //
    const getAppTypeInfoByIdQuery = (id: number) => useQuery(
        [queryKey, id],
        async () => {
            let res = (await getTypeInfoById({data: {id: id}})) as IData<{ typeInfo: IType }>;
            if (res.status==200) {
                let data = res.data.typeInfo;
                return {label: data.name, value: data.id} as SearchSelectOptionData;
            }
            return [];
        },
        getTypeListQueryConf,
    );

    if (articleData.typeId!=0) {
        const typeInfoQuery = getAppTypeInfoByIdQuery(articleData.typeId);
        let data = typeInfoQuery.data;
        console.log(data, "--d--")
        // if (data) {
        //     setValue(data.value);
        // }
    }

    return (
        <>
            <SearchSelect
                disabled={(getAppTypeListQuery.isError || getAppTypeListQuery.isLoading) ? true : false}
                mode="single"
                showSearch={true}
                allowClear
                value={value}
                option={option}
                loading={loading}
                onSearch={handleSearch}
                placeholder={(getAppTypeListQuery.isError || getAppTypeListQuery.isLoading) ? '请求数据中...' : '请选择分类'}
                style={{ width: 180 }}
                onChange={async (value) => {
                    let val = value as number;
                    setValue(val);
                    // 二级分类展示
                }}
            />
            <div className="me-3"></div>
            {(!getSecondTypeListQuery.isError && !getSecondTypeListQuery.isLoading && getSecondTypeListQuery.data.length>0) && (
                <SearchSelect
                    mode="single"
                    showSearch={true}
                    allowClear
                    option={secondOption}
                    onSearch={handleSecondSearch}
                    placeholder="请选择二级分类"
                    style={{ width: 180 }}
                    onChange={(value) => {
                        let val = value as number;
                    }}
                />
            )}
        </>
    );
};

export default ArticleType;