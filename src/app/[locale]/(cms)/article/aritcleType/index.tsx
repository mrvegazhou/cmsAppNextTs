'use client';
import { useState, useEffect } from "react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { IData, IType, ITypeAndPType } from '@/interfaces';
import type { TBody } from '@/types';
import { getTypeList, getTypeListByPid, getTypeInfoById, getTypeListQueryConf } from "@/services/api";
import SearchSelect, { SearchSelectOptionData } from "@/components/searchSelect";
import { useAtom } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";

const queryKey = 'typeList';
const queryKey2 = 'typeList2';

const ArticleType = (props: {init: boolean}) => {
    const t = useTranslations('ArticleEditPage');

    const [articleData, setArticleData] = useAtom(writeArticleAtom);

    const [value, setValue] = useState<number | undefined>();

    // 获取类型列表
    const getAppTypeListQuery = useQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            let res = (await getTypeList({data: {name: ''}})) as IData<{ typeList: IType[] }>;
            if (res.status==200) {
                let listRes = res.data.typeList.map((item, _) => {
                    return {label: item.name, value: item.id};
                });
                return listRes as SearchSelectOptionData[];
            }
            return [];
        },
        ...getTypeListQueryConf,
    });

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
        }, 80);
    };

    // 二级类别
    const getSecondTypeListQuery = useQuery({
        queryKey: [queryKey2, value],
        queryFn: async () => {
            if (typeof value=='undefined' || value<=0) {
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
        ...getTypeListQueryConf,
        // keepPreviousData : true
    });
    const [secondOption, setSecondOption] = useState<Array<SearchSelectOptionData>>([]);
    const [secondValue, setSecondValue] = useState<number | undefined>();
    const handleSecondSearch = (name: string) => {
        setTimeout(() =>  {
            if (getSecondTypeListQuery.isLoading) {
                setLoading(true);
            } else {
                let data = getSecondTypeListQuery.isError ? [] : getSecondTypeListQuery.data!;
                const filterOpion= data.filter((item)=>!!item.label.includes(name.trim()))
                setSecondOption([...filterOpion]);
            }
        }, 80);
    }

    const [defaultValue1, setDefaultValue1] = useState<Array<SearchSelectOptionData>>([]);
    const [defaultValue2, setDefaultValue2] = useState<Array<SearchSelectOptionData>>([]);

    const queryDefaultTypeinfo = useMutation({
        mutationFn: async (variables: TBody<{id: number}>) => {
            return (await getTypeInfoById(variables)) as IData<{typeInfo: ITypeAndPType}>;
        },
    });
    useEffect(() => {
        if (props.init) {
            if (articleData.typeId==0) return;
            queryDefaultTypeinfo.mutateAsync({
                data: {
                    id: articleData.typeId
                }
            }).then(res => {
                if (res.status == 200) {
                    if (typeof value=='undefined') {
                        let data = res.data.typeInfo;
                        if (data.pid!=0) {
                            setValue(data.pid);
                            setDefaultValue1([{label: data.pname, value: data.pid}]);
                            setSecondValue(data.id);
                            setDefaultValue2([{label: data.name, value: data.id}]);
                        } else {
                            if (data.id!=0) {
                                setDefaultValue1([{label: data.name, value: data.id}]);
                                setValue(data.id);
                            }
                        }
                    }
                }
            });
        }
    }, []);

    return (
        <>
            <SearchSelect
                disabled={(getAppTypeListQuery.isError || getAppTypeListQuery.isLoading) ? true : false}
                mode="single"
                showSearch={true}
                allowClear
                value={value}
                defaultValue={defaultValue1}
                option={option}
                loading={loading}
                onSearch={handleSearch}
                placeholder={(getAppTypeListQuery.isError || getAppTypeListQuery.isLoading) ? t('requestData') : t('selectCategory')}
                style={{ width: 180 }}
                onChange={(value) => {
                    let val = value as number;
                    setArticleData((pre: any) => {
                        return {...pre, ...{typeId: val}}
                    });
                    setValue(val);
                }}
            />
            <div className="me-3"></div>
            {((!getSecondTypeListQuery.isError && !getSecondTypeListQuery.isLoading && getSecondTypeListQuery.data!.length>0) || defaultValue2.length>0) && (
                <SearchSelect
                    mode="single"
                    showSearch={true}
                    defaultValue={defaultValue2}
                    allowClear
                    value={secondValue}
                    option={secondOption}
                    onSearch={handleSecondSearch}
                    placeholder="请选择二级分类"
                    style={{ width: 180 }}
                    onChange={(value) => {
                        let val = value as number;
                        setArticleData((pre: any) => {
                            return {...pre, ...{typeId: val}}
                        });
                    }}
                />
            )}
        </>
    );
};

export default ArticleType;