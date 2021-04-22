import { Injectable, Inject, HttpService } from '@nestjs/common';
import { MpUtil } from '../utils/mp.util';
import { MpModuleOptions } from '../interfaces/options.interface';
import { OPTIONS_PROVIDER } from '../constants/common.constant';
import { MP_AUTH_URL } from '../constants/mp.constant';
import { IricUtil } from '../utils/iric.util';
import { MpResolveMpTempCodeResponse } from '../interfaces/response/mp/resolve-mp-temp-code.mp.response.interface';
import { MpErrorWrapper } from '../decorators/error-wrapper.decorator';
import { LoginResponse } from '../interfaces/response/login.response.interface';
import { MpError } from '../errors/mp.error';

@Injectable()
export class MpService {
  constructor(
    @Inject(OPTIONS_PROVIDER)
    private readonly options: MpModuleOptions,
    private readonly httpService: HttpService,
    private readonly mpUtil: MpUtil
  ) {}

  /**
   * 小程序临时码登录
   * @param tempCode 小程序登录临时码
   * @param rawData 原始信息
   * @param signature 签名
   * @param encryptedData 加密信息
   * @param iv 偏移量
   * @param checkSignature 是否校验签名
   * @returns 登录解析用户信息
   */
  @MpErrorWrapper()
  async login(tempCode: string, rawData: string, signature: string, encryptedData: string, iv: string, checkSignature = true): Promise<LoginResponse> {
    const { data } = await this.httpService
      .get<MpResolveMpTempCodeResponse>(MP_AUTH_URL, {
        params: {
          appid: this.options.appId,
          secret: this.options.appSecret,
          js_code: tempCode,
          grant_type: 'authorization_code'
        }
      })
      .toPromise();

    if (!data || data.errcode) throw new MpError(data.errmsg?.toString());

    if (checkSignature && !this.mpUtil.checkSignature(data.session_key, rawData, signature)) throw new MpError('签名校验失败');

    const userInfo = this.mpUtil.decryptData(this.options.appId, data.session_key, encryptedData, iv);

    return { success: true, data: userInfo };
  }
}
