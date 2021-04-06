/**
 * 小程序解析Temp Code 请求URL
 * 文档详见：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
 */
export const MpAuthUrl = 'https://api.weixin.qq.com/sns/jscode2session';

/**
 * 小程序校验一张图片是否含有违法违规内容 请求URL
 * 文档详见：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.imgSecCheck.html
 */
export const ImageSecurityCheckUrl = 'https://api.weixin.qq.com/wxa/img_sec_check';

/**
 * 小程序校验文本内容是否含有违法违规内容 请求URL
 * 文档详见：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.msgSecCheck.html
 */
export const MessageSecurityCheckUrl = 'https://api.weixin.qq.com/wxa/msg_sec_check';

/**
 * 获取小程序全局唯一后台接口调用凭据 access_token
 * 文档详见：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html
 */
export const GetAccessTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
