import { Injectable } from "@nestjs/common";
import { createDecipheriv, createHash } from "crypto";
import { IMpUserInfo } from "../interfaces/mp-user-info.interface";

@Injectable()
export class MpUtil {
  /**
   * 签名校验，文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E6%96%B9%E5%BC%8F%E4%B8%80%EF%BC%9A%E5%BC%80%E5%8F%91%E8%80%85%E5%90%8E%E5%8F%B0%E6%A0%A1%E9%AA%8C%E4%B8%8E%E8%A7%A3%E5%AF%86%E5%BC%80%E6%94%BE%E6%95%B0%E6%8D%AE
   * @param sessionKey sessionKey (用临时code从小程序服务器获取到的)
   * @param rawData 原始数据
   * @param signature 签名
   */
  checkSignature(sessionKey: string, rawData: string, signature: string): boolean {
    return createHash('sha1').update(rawData + sessionKey).digest('hex') === signature;
  }

  /**
   * 解析小程序加密信息
   * @param appId 小程序AppID
   * @param sessionKey sessionKey (用临时code从小程序服务器获取到的)
   * @param encryptedData 密文
   * @param iv 偏移量
   */
  decryptData(appId: string, sessionKey: string, encryptedData: string, iv: string): IMpUserInfo {
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

      const result: IMpUserInfo = JSON.parse(decoded);

      if (result.watermark.appid !== appId)
        throw new Error('Illegal AppId')

      return result;
    } catch (err) {
      throw new Error('Illegal Buffer')
    }
  }
}