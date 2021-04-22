import { MpBaseResponse } from './base.response.mp.interface';

/** 小程序服务器校验临时code返回 */
export interface MpResolveMpTempCodeResponse extends MpBaseResponse {
  /** 用户唯一标识 */
  openid: string;

  /** 会话密钥 */
  session_key: string;

  /** 用户在开放平台的唯一标识符 */
  unionid?: string;
}
