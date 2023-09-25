export interface ILoginByEmailBody {
    email: string;
    password: string;
    code?: string;
}

export interface ISendEmailCode {
    email: string;
    codeType: number;
}

export interface IChangeNewPwdByEmailCode {
    code: string;
    email: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface IPageInfo {
    title?: string;
    content: string;
    type: number;
}

