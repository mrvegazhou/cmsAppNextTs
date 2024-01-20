'use client';
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import copy from 'copy-to-clipboard';
import { writeArticleContext } from "@/store/articleData";
import type { TBody } from '@/types';
import type { IData, IUser, IArticleCollabView } from '@/interfaces';
import { IUserList, IArticleId } from "@/interfaces"; 
import { throttle } from "lodash"
import LoaderComp from '@/components/loader/loader';
import { searchUserList, inviteCollab, collabViewList, exitCollab } from "@/services/api";
import Modal from '@/components/modal';
import useToast from '@/hooks/useToast';
import './index.scss';
import { GetCurrentUrl } from "@/lib/tool";

const InviteCollab = (props: {class?: string}) => {
    const { show } = useToast();
    
    const articleInfo = useRecoilValue(writeArticleContext);

    const [users, setUsers] = useState<IUser[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState(0);
    const inputRef = useRef(null);
    const numRef = useRef(null);
    const [collabUrl, setCollabUrl] = useState("");

    const [baseUrl, setBaseUrl] = useState<string>("");
    useEffect(() => {
        setBaseUrl(GetCurrentUrl());
    }, []);

    // 获取用户列表
    const searchUserMutation = useMutation(
        async (variables: TBody<{ name: string; page: number }>) => {
            return (await searchUserList(variables)) as IData<IUserList>;
        },
    );
    
    const throttleSearch = throttle(async (name, page) => {
        await searchUserMutation.mutateAsync({
            data: {
                name: name,
                page: page
            }
        }).then(res => {
            if (res.status == 200) {
                setUsers(res.data.userList);
                setPage(res.data.page!);
                setTotalPage(res.data.totalPage!);
            }
        });
        // @ts-ignore
        inputRef.current.value = name;
    }, 500);

    const handleSearch = () => {
        // @ts-ignore
        let name = (inputRef.current.value).trim();
        if (name=="") return;
        throttleSearch(name, 1);
    };

    const jump = (num: number) => {
        if (num==0) {
            return;
        }
        if (!isNaN(num)) {
            return;
        }
        // @ts-ignore
        let name = (inputRef.current.value).trim();
        if (name=="") return;
        throttleSearch(name, num);
    };

    // 选择的邀请用户
    const [collabUsers, setCollabUsers] = useState<IUser[]>([]);
    const [expireName, setExpireName] = useState("ttl1d");
    // 加入协作
    // 获取用户列表
    const inviteCollabMutation = useMutation(
        async (variables: TBody<{userIds: number[]; article: number; expireName: string}>) => {
            return (await inviteCollab(variables)) as IData<string>;
        },
    );
    const handleCopy = () => {
        if (collabUrl!="") {
            copy(collabUrl);
            show({ type: 'SUCCESS', message: "复制成功" });
        } else {
            show({ type: 'DANGER', message: "复制失败" });
        }
        return;
    };
    const inviteCollabHandle = async () => {
        if (collabUsers.length<=0) {
            show({ type: 'DANGER', message: "请选择协作用户" });
            return;
        }
        let collabUserIds: number[] = [];
        for (let data of collabUsers) {
            if (data.id) collabUserIds.push(data.id);
        }
        await inviteCollabMutation.mutateAsync({
            data: {
                userIds: collabUserIds,
                article: articleInfo.id ?? 0,
                expireName: expireName 
            }
        }).then(res => {
            if (res.status == 200) {
                const fullUrl = `${baseUrl}?t=${res.data}`;
                setCollabUrl(fullUrl);
                copy(fullUrl);
                show({ type: 'SUCCESS', message: "生成并复制协作地址成功" });
                return;
            } else {
                show({ type: 'DANGER', message: "邀请失败" });
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            return;
        });
    };

    // 移动到邀请列表
    const moveCollabUser = (userInfo: IUser) => {
        if (!userInfo) return;
        if (collabUsers.find((item) => item.id==userInfo.id)) return;
        setCollabUsers(prev => {
            let merged = [...prev, ...[userInfo]];            
            return merged;
        });
    };

    const clearCollabUsers = (id: string | number) => {
        if (id=="all") {
            setCollabUsers([]);
        } else if (typeof(id) == 'number' && !isNaN(id)) {
            setCollabUsers(prev => {
                let newVals = prev.filter((item) => item.id!=id);
                return [...newVals];
            });
        }
    };

    const onkeydown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const [open, setOpen] = useState<boolean>(false);
    const Content = useCallback((): JSX.Element => {
        return (
            <>
                {collabUrl!="" && 
                    (<div className="position-relative mb-4">
                        <div className="btn btn-sm btn-outline-success float-end top-0 end-0" style={{fontSize:".75em"}} onClick={handleCopy}>复制</div>
                        <code>
                            {collabUrl}
                        </code>
                    </div>)
                }
                
                <div className="clearfix"></div>
                <div className="invite-collab w-100 d-flex justify-content-around ">
                    <div className="left-list d-flex flex-column w-100 me-2 align-content-center">

                        <div className="bg-white border-0 rounded list-group-item d-flex flex-row flex-nowrap justify-content-center align-content-center ">
                            <input  ref={inputRef}
                                    onKeyDown={(e)=>onkeydown(e)}
                                    type="search" 
                                    className="form-control border-0 shadow-none" 
                                    placeholder="搜索用户" 
                                    aria-label="Search" 
                                    aria-describedby="search-addon" />
                            <span className="input-group-text border-0 cursor-pointer bg-white" onClick={handleSearch}>
                                <i className="iconfont icon-sousuo"></i>
                            </span>
                        </div>

                        <LoaderComp loading={searchUserMutation.isLoading} className='list-group mt-1 w-100'>
                        <>
                            <div className="list-group-item fw-bold">用户列表</div>
                            {users.map((item, idx) => {
                                return (
                                    <div className="list-group-item list-group-item-action text-truncate d-flex align-items-center justify-content-between" key={idx}>
                                        <span>{item.nickname}</span>
                                        <i  data-info={item} 
                                            onClick={() => moveCollabUser(item)}
                                            className="iconfont icon-youjiantou fs-5 text-secondary cursor-pointer px-1"></i>
                                    </div>
                                );
                            })}
                        </>
                        </LoaderComp>
                        <div className="img-pagination">
                            <span className="img-nav">
                                {page>1 && (
                                    <i className='iconfont icon-zuojiantou img-pageBtn me-2' onClick={()=>jump(page-1)}></i>
                                )}
                                <span className="img-pageNum">
                                    <label>{page}</label> 
                                    <span>/</span> 
                                    <label>{totalPage}</label>
                                </span> 
                                <i className='iconfont icon-youjiantou img-pageBtn' onClick={()=>jump(page+1)}></i>
                            </span> 
                            <span className="img-page-form">
                                <input type="number" className="img-page-input" ref={numRef} /> 
                                <a href="#!" className="img-page-link" onClick={()=>{ 
                                    // @ts-ignore
                                    jump(numRef.current.value);}
                                }>跳转</a>
                            </span>
                        </div>
                    </div>
                    <div className='right-list list-group w-100 ms-3'>
                        <div className="list-group-item border-0 d-flex align-items-center flex-nowrap justify-content-between" style={{backgroundColor:'#f9f9f9'}}>
                            <div className="d-flex align-items-center">
                                <div className="me-2">失效时间</div>
                                <select className="form-select-sm mx-auto my-auto" 
                                        onChange={e => setExpireName(e.target.value)}
                                        value={expireName}>
                                    <option value="ttl0">不限制</option>
                                    <option value="ttl1w">1周</option>
                                    <option value="ttl1d">1天</option>
                                    <option value="ttl5h">5小时</option>
                                    <option value="ttl30s">30分</option>
                                </select>
                            </div>
                            <div className="text-primary float-end cursor-pointer px-1" onClick={() => clearCollabUsers("all")}>清除</div>
                        </div>
                        <div className="list-group-item fw-bold rounded-top border-top">
                            协作人员
                        </div>
                        {collabUsers.map((item, idx) => {
                            return (
                                <div className="list-group-item list-group-item-action text-truncate d-flex align-items-center justify-content-between" key={idx}>
                                    {item.nickname}
                                    <i  onClick={()=>clearCollabUsers(item.id!)}
                                        className="iconfont icon-trash text-danger fs-5 text-secondary cursor-pointer px-1"></i>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="text-center mt-2">
                    <button disabled={inviteCollabMutation.isLoading} type="button" className="btn btn-outline-primary" onClick={inviteCollabHandle}>生成协作地址</button>
                </div>
            </>
        );
    }, [users, collabUsers, collabUrl]);

    const [type, setType] = useState<string>("");
    const newBuild = () => {
        setOpen(true);
        setType("newBuild");
    };

    // 协作列表
    const [collabList, setCollabList] = useState<IArticleCollabView>({});
    // 获取用户列表
    const getCollabViewListMutation = useMutation(
        async () => {
            return (await collabViewList()) as IData<IArticleCollabView>;
        }
    );
    
    const viewCollab = async () => {
        setOpen(true);
        setType("view");
        await getCollabViewListMutation.mutateAsync().then(res => {
            if (res.status == 200) {
                setCollabList(res.data);
                return;
            } else {
                show({ type: 'DANGER', message: "查看失败" });
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            return;
        });
    };

    const copyInView = (fullUrl: string) => {
        copy(fullUrl);
        show({ type: 'SUCCESS', message: "复制成功" });
    };

    const ViewContent = useCallback((): JSX.Element => {
        return (
        <>
            <div className="list-group">
            {Object.keys(collabList).map((key, idx) => {
                let articleId = Number(key);
                return (
                    <div key={idx} className="list-group-item list-group-item-action text-truncate">
                        {articleId==0 ? 
                            (<div className="d-flex align-items-center justify-content-between">
                                <div style={{flex: "0 0 47%"}} className="overflow-x-auto">{articleInfo.title.trim()!="" ? articleInfo.title : <span className='text-primary'>正在编辑的...</span>}</div>
                                <div style={{flex: "0 0 47%"}} className="overflow-x-auto">{
                                    collabList[articleId].userList.map((u, i) => {
                                        return (
                                            <span key={i} className="p-1 me-2">{u.nickname}</span>
                                        );
                                    })
                                }</div>
                                <div style={{flex: "0 0 6%"}}><i className="cursor-pointer iconfont icon-trash text-danger fs-5 p-1" onClick={()=>handleExit(articleId)}/></div>
                            </div>)
                         : (
                            <div className="d-flex align-items-center justify-content-between">
                                <div style={{flex: "0 0 47%"}} className="overflow-x-auto">{collabList[articleId].articleInfo.info.title}</div>
                                <div style={{flex: "0 0 47%"}} className="overflow-x-auto">{
                                    collabList[articleId].userList.map((u, i) => {
                                        return (
                                            <span key={i} className="p-1 me-2">{u.nickname}&nbsp;</span>
                                        );
                                    })
                                }</div>
                                <div style={{flex: "0 0 6%"}}><i className="cursor-pointer iconfont icon-trash text-danger fs-5 p-1" onClick={()=>handleExit(articleId)}/></div>
                            </div>
                         )
                        }
                        <div className="d-flex align-items-center justify-content-between">
                            <code style={{flex: "0 0 94%"}} className="overflow-x-auto">{`${baseUrl}${collabList[articleId].articleInfo.tokenUrl}`}</code>
                            <i style={{flex: "0 0 6%"}} className="iconfont icon-copy fs-5 opacity-50 cursor-pointer ms-1" onClick={()=>copyInView(`${baseUrl}${collabList[articleId].articleInfo.tokenUrl}`)}/>
                        </div>
                    </div>
                );
            })}     
            </div>
        </>
        );
    }, [collabList]);

    // 解散协作
    const exitCollabMutation = useMutation(
        async (variables: TBody<IArticleId>) => {
            return (await exitCollab(variables)) as IData<boolean>;
        }
    );

    const handleExit = async (id: number) => {
        await exitCollabMutation.mutateAsync({data:{articleId:id}}).then(res => {
            if (res.status == 200) {

                return;
            } else {
                show({ type: 'DANGER', message: "查看失败" });
                return;
            }
        }).catch((e) => {
            show({ type: 'DANGER', message: e.message });
            return;
        });
    };
    
    return (
        <div className={classNames(props.class, "dropdown")}>
            <span className="text-decoration-none" id="dropdownLoginLink" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="iconfont icon-xiezuo fs-5 text-black opacity-75 cursor-pointer" />
            </span>
            <ul className="dropdown-menu" aria-labelledby="dropdownLoginLink" style={{ left: "auto", right: 0 }}>
                <li>
                    <span className="dropdown-item cursor-pointer"
                        onClick={newBuild}>
                        <i className="iconfont icon-xinjian1 fs-6 pe-2" />新建
                    </span>
                </li>
                <li><hr className="dropdown-divider opacity-50 mx-2" /></li>
                <li>
                    <span className="dropdown-item cursor-pointer" onClick={viewCollab}>
                        <i className="iconfont icon-gongzuozu- fs-6 pe-2" />查看
                    </span>
                </li>
            </ul>
            <Modal
                title={type=="newBuild" ? "协作邀请" : "协作列表"}
                isOpen={open}
                onClosed={()=>{setOpen(false);}}
                type="light"
                useButton={false}
                minWidth={type=="newBuild" ? 620 : 700}
            >
                {type=="newBuild" ? <Content /> : <ViewContent />}
            </Modal>
        </div>
    );
};

export default InviteCollab;