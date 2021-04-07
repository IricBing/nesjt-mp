import { Injectable, Inject, HttpService } from '@nestjs/common';
import { MpUtil } from '../utils/mp.util';
import { MpModuleOptions } from '../interfaces/options.interface';
import { OPTIONS_PROVIDER } from '../constants/common.constant';
import { IMpUserInfo } from '../interfaces/mp-user-info.interface';
import { IResolveMpTempCodeRes } from '../interfaces/resolve-mp-temp-code.res.interface';
import { MP_AUTH_URL, IMAGE_SECURITY_CHECK_URL, MESSAGE_SECURITY_CHECK_URL } from '../constants/mp.constant';
import { IricUtil } from '../utils/iric.util';
import { ICheckImageSecurityRes } from '../interfaces/check-image-security-res.interface';
import * as FormData from 'form-data';
import { v4 as uuid } from 'uuid';
import { ICheckMessageSecurityRes } from '../interfaces/check-message-security-res.interface';

@Injectable()
export class MpService {
  constructor(
    @Inject(OPTIONS_PROVIDER)
    private readonly config: MpModuleOptions,
    @Inject(HttpService)
    private readonly httpService: HttpService,
    private readonly mpUtil: MpUtil,
    private readonly iricUtil: IricUtil
  ) {}

  /**
   * 小程序临时码登录
   * @param tempCode 小程序登录临时码
   * @param rawData 原始信息
   * @param signature 签名
   * @param encryptedData 加密信息
   * @param iv 偏移量
   * @param checkSignature 是否校验签名
   */
  async login(
    tempCode: string,
    rawData: string,
    signature: string,
    encryptedData: string,
    iv: string,
    checkSignature = true
  ): Promise<{ success: boolean; userInfo?: IMpUserInfo; errorMessage?: string }> {
    try {
      const { data } = await this.httpService
        .get<IResolveMpTempCodeRes>(MP_AUTH_URL, {
          params: {
            appid: this.config.appId,
            secret: this.config.appSecret,
            js_code: tempCode,
            grant_type: 'authorization_code'
          }
        })
        .toPromise();

      if (!data || data.errcode)
        return {
          success: false,
          errorMessage: data.errcode?.toString()
        };

      if (checkSignature && !this.mpUtil.checkSignature(data.session_key, rawData, signature)) return { success: false, errorMessage: '签名校验失败' };

      const userInfo = this.mpUtil.decryptData(this.config.appId, data.session_key, encryptedData, iv);

      return { success: true, userInfo };
    } catch (error) {
      return {
        success: false,
        errorMessage: this.iricUtil.parseError(error)
      };
    }
  }

  /**
   * 检查图片是否安全合法
   * @param media 图片Buffer信息
   */
  async imageSecurityCheck(media: Buffer): Promise<{ success: boolean; security?: boolean; errorMessage?: string }> {
    try {
      const form = new FormData();
      form.append('type', 'image');
      form.append('media', media, uuid());
      const { data } = await this.httpService
        .post<ICheckImageSecurityRes>(IMAGE_SECURITY_CHECK_URL, form, {
          params: { access_token: await this.mpUtil.getAccessToken() },
          headers: Object.assign({ 'Content-Length': form.getLengthSync() }, form.getHeaders())
        })
        .toPromise();

      return {
        success: true,
        security: !data.errcode,
        errorMessage: data.errcode ? data.errmsg : undefined
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: this.iricUtil.parseError(error)
      };
    }
  }

  /**
   * 文本内容敏感信息检测
   * @param content 文本内容
   */
  async messageSecurityCheck(content: string): Promise<{ success: boolean; security?: boolean; errorMessage?: string }> {
    try {
      const { data } = await this.httpService
        .post<ICheckMessageSecurityRes>(
          MESSAGE_SECURITY_CHECK_URL,
          { content },
          {
            params: { access_token: await this.mpUtil.getAccessToken() }
          }
        )
        .toPromise();

      return {
        success: true,
        security: !data.errcode,
        errorMessage: data.errcode ? data.errmsg : undefined
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: this.iricUtil.parseError(error)
      };
    }
  }
}
