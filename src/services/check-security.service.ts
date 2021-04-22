import { HttpService, Injectable } from '@nestjs/common';
import { IMAGE_SECURITY_CHECK_URL, MESSAGE_SECURITY_CHECK_URL } from '../constants/mp.constant';
import * as FormData from 'form-data';
import { v4 as uuid } from 'uuid';
import { CheckSecurityResponse } from '../interfaces/response/check-security.response.interface';
import { MpCheckImageSecurityResponse } from '../interfaces/response/mp/check-security/check-image-security.mp.response.interface';
import { MpUtil } from '../utils/mp.util';
import { MpCheckMessageSecurityResponse } from '../interfaces/response/mp/check-security/check-message-security.mp.response.interface';

@Injectable()
export class MpCheckSecurityService {
  constructor(private readonly httpService: HttpService, private readonly mpUtil: MpUtil) {}

  /**
   * 检查图片是否安全合法
   * @param media 图片Buffer信息
   * @returns 图片敏感信息检测结果
   */
  async image(media: Buffer): Promise<CheckSecurityResponse> {
    const form = new FormData();
    form.append('type', 'image');
    form.append('media', media, uuid());
    const { data } = await this.httpService
      .post<MpCheckImageSecurityResponse>(IMAGE_SECURITY_CHECK_URL, form, {
        params: { access_token: await this.mpUtil.getAccessToken() },
        headers: Object.assign({ 'Content-Length': form.getLengthSync() }, form.getHeaders())
      })
      .toPromise();

    return { success: true, data: !!data.errcode };
  }

  /**
   * 文本内容敏感信息检测
   * @param content 文本内容
   * @returns 文本敏感信息检测结果
   */
  async message(content: string): Promise<CheckSecurityResponse> {
    const { data } = await this.httpService
      .post<MpCheckMessageSecurityResponse>(
        MESSAGE_SECURITY_CHECK_URL,
        { content },
        {
          params: { access_token: await this.mpUtil.getAccessToken() }
        }
      )
      .toPromise();

    return { success: true, data: !!data.errcode };
  }
}
