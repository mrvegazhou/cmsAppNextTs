import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import Modal from '@/components/modal';
import type { TBody } from '@/types';
import { IData, IReportReasonReq, IReportReason, ReportReasonCondition, IImageState } from '@/interfaces';
import { getReportReasonList, sendReportReason, getReportReasonsQueryConf } from "@/services/api";
import { API_URL, PERSONAL_IMAGE_URL } from '@/lib/constant';
import styles from "./index.module.scss";
import { isNullOrUnDef } from "@/lib/is";
import useToast from '@/hooks/useToast';
import LoaderComp from '@/components/loader/loader';
import useUploadImg from "@/hooks/useUploadImg";

interface propsType {

}
export const ReportComp = forwardRef((props: propsType, ref) => {
    const t = useTranslations('ReportReasonPage');
    const { show } = useToast();
    // 举报弹窗
    const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
    const [reportType, setReportType] = useState<string>();
    const [reportReasons, setReportReasons] = useState<IReportReason[]>([]);
    const [reportReasonId, setreportReasonId] = useState<number>();
    const [reportReasonChilren, setReportReasonChilren] = useState<IReportReason[]>([]);
    const [reasonId, setReasonId] = useState<number>();
    const [reasonConditon, setReasonCondition] = useState<ReportReasonCondition>({} as ReportReasonCondition);

    const sendReportMutation = useMutation({
        mutationFn: async (variables: TBody<IReportReasonReq>) => {
            return (await sendReportReason(variables)) as IData<boolean>;
        },
    });

    const getReportReasonsQuery = useQuery({
        queryKey: ["reportReasons"],
        queryFn: async () => {
            let res = (await getReportReasonList()) as IData<IReportReason[]>;
            if (res.status==200) {
                return res.data;
            }
            return [];
        },
        ...getReportReasonsQueryConf,
    });

    useEffect(() => {
        if (getReportReasonsQuery.isSuccess) {
            setReportReasons(getReportReasonsQuery.data);
        }
    }, [getReportReasonsQuery]);

    const showReportModal = useCallback((id: number, type: string) => {
        setReportModalOpen(true);
        setReportType(`${id}:${type}`);
    }, []);

    const checkReportReason = useCallback((reportReasonId: number, idx: number) => {
        setreportReasonId(reportReasonId);
        if (!isNullOrUnDef(reportReasons[idx].nodes) && reportReasons[idx].nodes.length>0) {
            setReportReasonChilren(reportReasons[idx].nodes);
        }
    }, [reportReasons]);

    const checkReason = useCallback((reasonId: number, condition: ReportReasonCondition) => {
        setReasonId(reasonId);
        setReasonCondition(condition);
    }, []);

    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const {
        imgs,
        setImgs,
        delImg,
        uploadImgMutation,
        onFileUpload
    } = useUploadImg({
        fileUploadRef: fileUploadRef, 
        type: 5,
        width: 100,
        limitStr: t('imageUploadLimit'),
        uploadErrStr: t('imageUploadErr')
    });
    
    
    const fileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imgs.length>5) {
            show({
                type: 'DANGER',
                message: t('imageCountLimit')
            });
            return;
        }
        // 相同的图片不用上传
        const imgState = await onFileUpload(e);
        
    }, [imgs]);

    useImperativeHandle(ref, () => ({ showReportModal: showReportModal }));

    return (
        <>
            <Modal
                title={t('reportTitle')}
                isOpen={reportModalOpen}
                onClosed={()=>{setReportModalOpen(false);}}
                type="light"
                useButton={false}
                minWidth={490}
                className={styles.zIndex}
            >
                <div className={styles.reportModal}>
                    <div className={styles.reportReasonNode}>
                        <div className={styles.reasonName}><span className={styles.asterisk}>* &nbsp;</span>请选择举报类型</div>
                        <div className={styles.reportReasonNodeItems}>
                        {reportReasons.map((reportReason, idx) => {
                            return (
                                <div className={classNames(styles.reportReasonItem, reportReasonId==reportReason.id && styles.selected)} key={idx} onClick={()=>checkReportReason(reportReason.id, idx)}>
                                    {reportReason.name}
                                </div>
                            );
                        })}
                        </div>
                        {(reportReasonChilren.length>0 &&
                            (<>
                                <div className={styles.reasonName}><span className={styles.asterisk}>* &nbsp;</span>请选择具体原因</div>
                                <div className={styles.reportReasonNodeItems}>
                                {reportReasonChilren.map((reportReason, idx) => {
                                    return (
                                        <div className={classNames(styles.reportReasonItem, reasonId==reportReason.id && styles.selected)} key={idx} onClick={()=>checkReason(reportReason.id, reportReason.condition)}>
                                            {reportReason.name}
                                        </div>
                                    );
                                })}
                                </div>
                            </>)
                        )}
                        {(!isNullOrUnDef(reasonConditon.desc) && reasonConditon.desc.isShow) && (
                            <>
                                <div className={styles.reasonName}>请填写举报信息</div>
                                <div className={styles.reportInput}>
                                    <textarea className={styles.reportInputArea} rows={5} placeholder="您可以提供详细的举报说明，便于我们更快处理，如：哪部分的文字/图片存在「涉政不当言论」。（选填）"></textarea>
                                    <div className={styles.wordCount}>0&nbsp;/&nbsp;500</div>
                                </div>
                            </>
                        )}
                        {(!isNullOrUnDef(reasonConditon.pictures) && reasonConditon.pictures.isShow) && (
                        <div className={styles.uploadImg}>
                            {imgs.length<5 &&
                            (<LoaderComp loading={uploadImgMutation.isPending} className='d-flex flex-column' style={{width:'70px'}}>
                                    <label>
                                        <div className={styles.plus}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1772F6" className="plusIcon"><path fillRule="evenodd" d="M1.994 12a.75.75 0 0 1 .75-.75h18.512a.75.75 0 0 1 0 1.5H2.744a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"></path><path fillRule="evenodd" d="M12 2.04a.75.75 0 0 1 .75.75V21.21a.75.75 0 1 1-1.5 0V2.79a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"></path></svg>
                                        </div>
                                        <input type="file" accept=".jpeg,.jpg,.png,.bmp"  multiple={false} style={{display:'none'}} onChange={fileChange} ref={fileUploadRef} />
                                    </label>
                                </LoaderComp>
                            )}
                            
                            {imgs.map((img, idx) => {
                                return (
                                    <div className={styles.imgsItem} key={idx}>
                                        <img src={img.image.src}  alt={img.image.fileName} className={styles.img} />
                                        <i className="iconfont icon-close" onClick={()=>delImg(idx)}/>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                        <div className={styles.rules}>
                            了解更多社区规则，请点击：<a href="https://zhuanlan.zhihu.com/p/506696688">《社区规范》</a>
                        </div>
                        <div className={styles.submit}>
                            <button name="confirmVerify" disabled={false} type="button" className="w-50 btn btn-outline-primary " >提交</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
});
ReportComp.displayName = "ReportComp";