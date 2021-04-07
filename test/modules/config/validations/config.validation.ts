import * as Joi from 'joi';

/** .env文件校验 */
export const ConfigValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  // 微信小程序相关配置
  MP_APP_ID: Joi.string().required(),
  MP_APP_SECRET: Joi.string().required(),

  // Redis MP数据库配置
  REDIS_MP_NAME: Joi.string().default('mp'),
  REDIS_MP_DB: Joi.number().default(1),
  REDIS_MP_HOST: Joi.string().default('127.0.0.1'),
  REDIS_MP_PORT: Joi.number().default(6379),
  REDIS_MP_PASSWORD: Joi.string()
    .allow('')
    .default(''),
  REDIS_MP_KEY_PREFIX: Joi.string().default('mp-')
});
