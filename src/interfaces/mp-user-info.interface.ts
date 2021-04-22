/** 解密小程序加密信息得到的用户信息 */
export interface MpUserInfo {
  /** 用户openid */
  openId: string;

  /** 用户在开放平台的唯一标识符 */
  unionId?: string;

  /** 用户昵称 */
  nickName: string;

  /** 获取微信填写性别 */
  gender: number;

  /** 语言 */
  language: 'zh_CN' | 'en_US';

  /** 获取微信填写城市 */
  city: string;

  /** 获取微信填写省 */
  province: string;

  /** 获取微信填写国家 */
  country: string;

  /** 获取用户头像 */
  avatarUrl: string;

  /** 水印 */
  watermark: {
    /** 时间戳 */
    timestamp: number;

    /** 小程序appid */
    appid: string;
  };
}
