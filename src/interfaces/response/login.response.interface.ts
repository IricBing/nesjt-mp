import { MpUserInfo } from '../mp-user-info.interface';
import { BaseResponse } from './base.response.interface';

/** 登录返回结果 */
export interface LoginResponse extends BaseResponse<MpUserInfo> {}
