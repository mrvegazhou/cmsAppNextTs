'use client';

import {
    useState,
    forwardRef,
    useImperativeHandle,
    memo
} from 'react';
import useToast from '@/hooks/useToast';
import { useTranslations } from 'use-intl';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import styles from '@/app/[locale]/search/searchBar.module.scss';
import { searchTrendingToday } from "@/services/api";
import type { TBody } from '@/types';
import type {
    IData
} from '@/interfaces';

const SearchBar = forwardRef((props, ref) => {
    const t = useTranslations('Navbar');
    const [showSearchLayer, setShowSearchLayer] = useState(false);
    const { show } = useToast();

    // 将外部需要访问的属性和方法暴露出去
    useImperativeHandle(ref, () => ({
        setSearchLayer,
        setShowSearchLayer
    }))


    function setSearchLayer() {
        setShowSearchLayer(!showSearchLayer);
    }

    const searchTrendingTodayMutation = useMutation(
        async (variables: TBody<{val: string}>) => {
           return await searchTrendingToday(variables);
        }
    );

    async function onSubmit() {
        try {
            const body = {
                val: "sss",
              } as any;
            let res = await searchTrendingTodayMutation.mutateAsync({data: body}) as IData<any>;
        } catch (e: any) {
            
            show({
                type: 'DANGER',
                message: e,
            });
        } finally {

        }
    }
    return (
        <>
            <div className={classNames("d-flex input-group", styles.searchDiv)}>
                <input
                    type="search"
                    className={classNames("form-control", styles.searchInput, styles.formControl)}
                    placeholder={t("search")}
                    aria-label="Search"
                    aria-describedby="search-addon"
                    onClick={setSearchLayer}
                />
                <span className={classNames("border-0", styles.searchTool)} id="search-addon" onClick={onSubmit}>
                    <i className="iconfont icon-sousuo fs-5 cursor-pointer"></i>
                </span>
                {showSearchLayer && (
                    <div className={classNames(styles.card)}>
                        <div className={classNames("d-flex align-items-center justify-content-left mt-2", styles.borderBottom)}>
                            <i className="iconfont icon-trending_up fs-4"></i>
                            <span className='small'>{t('trendingToday')}</span>
                        </div>
                        <div className={classNames(styles.list, styles.borderBottom)}>
                            <i className="iconfont icon-remen fs-4"></i>
                            <div className="d- flex-column ml-3">
                                <span>Client communication policy</span>
                                <small>#politics - may - @max</small>
                            </div>
                        </div>
                        <div className={classNames(styles.list, styles.borderBottom)}>
                            <i className="iconfont icon-remen fs-4"></i>
                            <div className="d-flex flex-column ml-3">
                                <span>Major activity done</span>
                                <small>#news - nov - @settings</small>
                            </div>
                        </div>
                        <div className={classNames(styles.list, styles.borderBottom)}>
                            <i className="iconfont icon-remen fs-4"></i>
                            <div className="d-flex flex-column ml-3">
                                <span>Major activity done</span>
                                <small>#news - nov - @settings</small>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});
SearchBar.displayName = "SearchBar";
export default memo(SearchBar);