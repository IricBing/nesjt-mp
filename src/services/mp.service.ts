import { Injectable, Inject, HttpService } from "@nestjs/common";
import { MpUtil } from "../utils/mp.util";
import { IConfig } from "../interfaces/config.interface";
import { ConfigProvider } from "../constants/common.constant";
import { IMpUserInfo } from "../interfaces/mp-user-info.interface";
import { IResolveMpTempCodeRes } from "../interfaces/resolve-mp-temp-code.res.interface";
import { MpAuthUrl } from "../constants/mp.constant";
import { IricUtil } from "../utils/iric.util";

@Injectable()
export class MpService {
  constructor(
    @Inject(ConfigProvider) private readonly config: IConfig,
    @Inject(HttpService) private readonly httpService: HttpService,
    private readonly mpUtil: MpUtil,
    private readonly iricUtil: IricUtil
  ) { }

  /**
   * 小程序临时码登录
   * @param tempCode 小程序登录临时码
   * @param rawData 原始信息
   * @param signature 签名
   * @param encryptedData 加密信息
   * @param iv 偏移量
   * @param checkSignature 是否校验签名
   */
  async login(tempCode: string, rawData: string, signature: string, encryptedData: string, iv: string, checkSignature = true):
    Promise<{ success: boolean, userInfo?: IMpUserInfo, errorMessage?: string }> {
    try {
      const { data } = await this.httpService.get<IResolveMpTempCodeRes>(MpAuthUrl, {
        params: {
          appid: this.config.appId,
          secret: this.config.appSecret,
          js_code: tempCode,
          grant_type: "authorization_code"
        }
      }).toPromise();

      if (!data || data.errcode) return {
        success: false,
        errorMessage: data && data.errcode ? data.errcode.toString() : null
      }

      if (checkSignature && !this.mpUtil.checkSignature(data.session_key, rawData, signature))
        return { success: false, errorMessage: '签名校验失败' }

      const userInfo = this.mpUtil.decryptData(this.config.appId, data.session_key, encryptedData, iv);

      return { success: true, userInfo }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.iricUtil.parseError(error)
      }
    }
  }
}