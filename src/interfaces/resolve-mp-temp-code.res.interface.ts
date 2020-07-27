
/** 小程序服务器校验临时code返回 */
export interface IResolveMpTempCodeRes {

  /** 用户唯一标识 */
  openid: string;

  /** 会话密钥 */
  session_key: string;

  /** 用户在开放平台的唯一标识符 */
  unionid?: string;

  /** 错误码 */
  errcode: number;

  /** 错误信息 */
  errmsg?: string;
}