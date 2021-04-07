import { registerAs } from '@nestjs/config';

export const RedisConfigRegister = registerAs('redis', () => ({
  mp: {
    name: process.env.REDIS_MP_NAME,
    db: process.env.REDIS_MP_DB,
    host: process.env.REDIS_MP_HOST,
    port: parseInt(process.env.REDIS_MP_PORT),
    password: process.env.REDIS_MP_PASSWORD,
    keyPrefix: process.env.REDIS_MP_KEY_PREFIX
  }
}));
