import { Injectable, OnModuleInit, Inject, HttpService } from '@nestjs/common';
import { createDecipheriv, createHash } from 'crypto';
import { MpUserInfo } from '../interfaces/mp-user-info.interface';
import { AccessTokenConfig } from '../interfaces/access-token.interface';
import { ACCESS_TOKEN_CONFIG_PROVIDER, OPTIONS_PROVIDER, REDIS_CLIENT_PROVIDER } from '../constants/common.constant';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { GET_ACCESS_TOKEN_URL } from '../constants/mp.constant';
import { MpModuleOptions } from '../interfaces/options.interface';
import { Redis } from 'ioredis';
import { ACCESS_TOKEN_REDIS_KEY } from '../constants/redis.constant';
import { MpGetAccessTokenResponse } from '../interfaces/response/mp/get-access-token.mp.response.interface';

@Injectable()
export class MpUtil implements OnModuleInit {
  constructor(
    @Inject(OPTIONS_PROVIDER)
    private readonly options: MpModuleOptions,
    @Inject(ACCESS_TOKEN_CONFIG_PROVIDER)
    private readonly accessTokenConfig: AccessTokenConfig,
    @Inject(REDIS_CLIENT_PROVIDER)
    private readonly redisClient: Redis,
    private readonly httpService: HttpService
  ) {}

  /** access token 本地存储文件路径 */
  private readonly accessTokenFileName = './access_token.txt';

  async onModuleInit() {
    if (this.redisClient) return; // 采用redis模式时，直接退出
    const exist = existsSync(join(__dirname, this.accessTokenFileName));
    if (exist) {
      const fileContent = readFileSync(join(__dirname, this.accessTokenFileName)).toString();
      const options: AccessTokenConfig = JSON.parse(fileContent);
      if (options.ExpiresAt > Date.now() + 60 * 1000) {
        //1分钟富裕时间
        this.accessTokenConfig.AccessToken = options.AccessToken;
        this.accessTokenConfig.ExpiresAt = options.ExpiresAt;
        return;
      }
    }

    await this.renewAccessToken();
  }

  /** 获取Access Token */
  async getAccessToken(): Promise<string> {
    if (this.redisClient) {
      const accessToken = await this.redisClient.get(ACCESS_TOKEN_REDIS_KEY);
      return accessToken ?? this.renewAccessToken();
    }

    if (!this.accessTokenConfig || !this.accessTokenConfig.AccessToken || this.accessTokenConfig.ExpiresAt < Date.now() + 60 * 1000) {
      await this.renewAccessToken();
      return this.accessTokenConfig.AccessToken;
    }
    return this.accessTokenConfig.AccessToken;
  }

  /**
   * 签名校验，文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E6%96%B9%E5%BC%8F%E4%B8%80%EF%BC%9A%E5%BC%80%E5%8F%91%E8%80%85%E5%90%8E%E5%8F%B0%E6%A0%A1%E9%AA%8C%E4%B8%8E%E8%A7%A3%E5%AF%86%E5%BC%80%E6%94%BE%E6%95%B0%E6%8D%AE
   * @param sessionKey sessionKey (用临时code从小程序服务器获取到的)
   * @param rawData 原始数据
   * @param signature 签名
   */
  checkSignature(sessionKey: string, rawData: string, signature: string): boolean {
    return (
      createHash('sha1')
        .update(rawData + sessionKey)
        .digest('hex') === signature
    );
  }

  /**
   * 解析小程序加密信息
   * @param appId 小程序AppID
   * @param sessionKey sessionKey (用临时code从小程序服务器获取到的)
   * @param encryptedData 密文
   * @param iv 偏移量
   */
  decryptData(appId: string, sessionKey: string, encryptedData: string, iv: string): MpUserInfo {
    const sessionKeyBuf = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuf = Buffer.from(encryptedData, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');

    try {
      // 解密
      const decipher = createDecipheriv('aes-128-cbc', sessionKeyBuf, ivBuf);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      let decoded = decipher.update(encryptedDataBuf, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      const result: MpUserInfo = JSON.parse(decoded);

      if (result.watermark.appid !== appId) throw new Error('Illegal AppId');

      return result;
    } catch (err) {
      throw new Error('Illegal Buffer');
    }
  }

  /** 重新获取access token */
  private async renewAccessToken(): Promise<string> {
    const { data } = await this.httpService
      .get<MpGetAccessTokenResponse>(GET_ACCESS_TOKEN_URL, {
        params: {
          appid: this.options.appId,
          secret: this.options.appSecret,
          grant_type: 'client_credential'
        }
      })
      .toPromise();

    if (!data || data.errcode) throw new Error(`Get access token failed and error code is ${data.errcode} error message is ${data.errmsg}`);

    if (this.redisClient) {
      await this.redisClient.setex(ACCESS_TOKEN_REDIS_KEY, data.expires_in, data.access_token);
    } else {
      const fileContent = JSON.stringify({ AccessToken: data.access_token, ExpiresAt: Date.now() + data.expires_in * 1000 });
      writeFileSync(join(__dirname, this.accessTokenFileName), fileContent);
      this.accessTokenConfig.AccessToken = data.access_token;
      this.accessTokenConfig.ExpiresAt = Date.now() + data.expires_in * 1000;
    }

    return data.access_token;
  }
}
