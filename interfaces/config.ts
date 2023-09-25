import type {
    IConfigEmailContentType,
    IConfigImageContentType,
    IConfigPhoneContentType,
  } from '@/types';
  
  export interface IConfigUser {
    rootId: number;
  }
  
  export interface IUpdateUserConfigBody {
    rootId?: string;
  }
  
  export interface IConfigSection {
    enableCreateNotice: boolean;
    enableUpdateNotice: boolean;
    enableUpdateStateNotice: boolean;
  }
  
  export interface IUpdateSectionConfigBody {
    enableCreateNotice?: boolean;
    enableUpdateNotice?: boolean;
    enableUpdateStateNotice?: boolean;
  }
  
  export interface IConfigPost {
    enableCreateNotice?: boolean;
    enableUpdateNotice?: boolean;
    enableUpdateContentNotice?: boolean;
    enableUpdateStateNotice?: boolean;
  }
  
  export interface IUpdatePostConfigBody {
    enableReview?: boolean;
  }
  
  export interface IConfigSite {
    helpLink?: string;
    feedbackLink?: string;
    reportLink?: string;
    githubLink?: string;
    mpImageLink?: string;
    disableRegistration?: boolean;
  }
  
  export interface IUpdateSiteConfigBody {
    helpLink?: string;
    feedbackLink?: string;
    reportLink?: string;
    githubLink?: string;
    mpImageLink?: string;
    disableRegistration?: boolean;
  }
  
  export interface IConfigJwt {
    tokenExp: string;
    refreshTokenExp: string;
  }
  
  export interface IUpdateJwtConfigBody {
    tokenExp?: string;
    refreshTokenExp?: string;
    generateNewKey?: boolean;
  }
  
  export interface IConfigQq {
    enable: boolean;
    responseType: string;
    clientId: string;
    redirectUri: string;
    state: string;
    scope: string;
    display: string;
    grantType: string;
  }
  
  export interface IUpdateQqConfigBody {
    enable?: boolean;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    state?: string;
  }
  
  export interface IConfigEmail {
    list: { [key in IConfigEmailContentType]?: IConfigEmailItem };
  }
  
  export interface IConfigCaptchaItem {
    enable: boolean;
    expire: string;
    total: number;
    interval: string;
    recoveryTime: string;
    length: number;
    alphanumeric: boolean;
    alphabetic: boolean;
    ascii: boolean;
    numeric: boolean;
  }
  
  export interface IConfigEmailAliyunItem extends IConfigCaptchaItem {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    accountName: string;
    addressType: number;
    replyToAddress: boolean;
    subject: string;
    toAddress: string;
    action: string;
    clickTrace: string;
    fromAlias: string;
    htmlBody: string;
    tagName: string;
    textBody: string;
    replyAddress: string;
    replyAddressAlias: string;
  }
  
  export interface IConfigEmailTencentItem extends IConfigCaptchaItem {
    secretId: string;
    secretKey: string;
    action: string;
    version: string;
    endpoint: string;
    region: string;
    fromEmailAddress: string;
    destination: string[];
    subject: string;
    replyToAddresses: string;
    template: {
      templateId: number;
      templateData: string;
    };
    simple: string;
    attachments: string;
    unsubscribe: string;
    triggerType: number;
  }
  
  export interface IConfigEmailItem {
    service: 'ALIYUN' | 'TENCENT';
    aliyun: IConfigEmailAliyunItem;
    tencent: IConfigEmailTencentItem;
  }
  
  export interface IUpdateEmailConfigBody {
    list: { [key in IConfigEmailContentType]?: IConfigEmailItemBody };
  }
  
  export interface IConfigCaptchaBody {
    enable: boolean;
    expire: string;
    total: number;
    interval: string;
    recoveryTime: string;
    length: number;
    alphanumeric: boolean;
    alphabetic: boolean;
    ascii: boolean;
    numeric: boolean;
  }
  
  export interface IConfigEmailAliyunBody {
    basic: IConfigCaptchaBody;
    accessKeyId: string;
    accessKeySecret: string;
    accountName: string;
    subject: string;
    fromAlias: string;
    htmlBody: string;
    tagName: string;
    replyAddress: string;
    replyAddressAlias: string;
  }
  
  export interface IConfigEmailTencentBody {
    basic: IConfigCaptchaBody;
    secretId: string;
    secretKey: string;
    region: string;
    fromEmailAddress: string;
    subject: string;
    replyToAddresses: string;
    template: {
      templateId: number;
    };
  }
  
  export interface IConfigEmailItemBody {
    service: 'ALIYUN' | 'TENCENT';
    aliyun: IConfigEmailAliyunBody;
    tencent: IConfigEmailTencentBody;
  }
  
  export interface IConfigPhoneItem {
    service: 'ALIYUN' | 'TENCENT';
    aliyun: IConfigPhoneAliyunItem;
    tencent: IConfigPhoneTencentItem;
  }
  
  export interface IConfigPhoneAliyunItem extends IConfigCaptchaItem {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    phoneNumbers: string;
    signName: string;
    templateCode: string;
    templateParam: string;
    smsUpExtendCode: string;
    outId: string;
  }
  
  export interface IConfigPhoneTencentItem extends IConfigCaptchaItem {
    secretId: string;
    secretKey: string;
    action: string;
    version: string;
    endpoint: string;
    region: string;
    phoneNumberSet: string[];
    smsSdkAppId: string;
    templateId: string;
    signName: string;
    templateParamSet: string[];
    extendCode: string;
    sessionContext: string;
    senderId: string;
  }
  
  export interface IConfigPhone {
    list: { [key in IConfigPhoneContentType]?: IConfigPhoneItem };
  }
  
  export interface IUpdatePhoneConfigBody {
    list: { [key in IConfigPhoneContentType]?: IConfigPhoneItemBody };
  }
  
  export interface IConfigPhoneItemBody {
    service: 'ALIYUN' | 'TENCENT';
    aliyun: IConfigPhoneAliyunBody;
    tencent: IConfigPhoneTencentBody;
  }
  
  export interface IConfigPhoneAliyunBody {
    basic: IConfigCaptchaBody;
    accessKeyId: string;
    accessKeySecret: string;
    signName: string;
    templateCode: string;
  }
  
  export interface IConfigPhoneTencentBody {
    basic: IConfigCaptchaBody;
    secretId: string;
    secretKey: string;
    region: string;
    smsSdkAppId: string;
    templateId: string;
    signName: string;
  }
  
  export interface IConfigImage {
    list: { [key in IConfigImageContentType]?: IConfigImageItem };
  }
  
  export interface IYwOauthClient {
    enable: boolean;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scope: string;
    state: string;
    clientName: string;
    clientSite: string;
    clientLogo: string;
    imagePathPrefix?: string;
    remark?: string;
  }
  
  export interface IYwOauthClientUrl {
    enable: boolean;
    clientId: string;
    clientName: string;
    clientLogo: string;
    url: string;
  }
  
  export interface IConfigOauthClient {
    showMenuEntry: boolean;
    doc?: string;
    ywClients: IYwOauthClient[];
    ywClientUrls?: IYwOauthClientUrl[];
  }
  
  export interface IConfigImageItem {
    captchaConfig: IConfigCaptchaItem;
  }
  
  export interface IUpdateImageConfigBody {
    list: { [key in IConfigImageContentType]?: IConfigImageItemBody };
  }
  
  export interface IConfigImageItemBody extends IConfigCaptchaItem {}
  
  export interface IUpdateOauthClientConfigBody {
    showMenuEntry?: boolean;
    doc?: string;
    ywClients?: IYwOauthClient[];
  }
  