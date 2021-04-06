import { IBaseRes } from './base.res.interface';

/** http请求微信服务器获取Access Token返回数据格式 */
export interface IGetAccessTokenRes extends IBaseRes {
  /** 获取到的凭证 */
  access_token: string;

  /** 凭证有效时间，单位：秒。目前是7200秒之内的值 */
  expires_in: number;
}
