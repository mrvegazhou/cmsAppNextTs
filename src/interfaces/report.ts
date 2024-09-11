
export interface ReportReasonConstraint {
    isRequired: boolean;
    isShow: boolean;
    max: number;
    min: number;
    tips: string;
}

export interface ReportReasonCondition {
    url: ReportReasonConstraint;
    desc: ReportReasonConstraint;
    pictures: ReportReasonConstraint;
}

export interface IReportReason {
    id: number;
    name: string;
    condition: ReportReasonCondition;
    nodes?: IReportReason[];
}

export interface IReportReasonReq {
    reasonId: number;
}