import { registerAs } from '@nestjs/config';

export const MpRegister = registerAs('mp', () => ({
  appId: process.env.MP_APP_ID,
  appSecret: process.env.MP_APP_SECRET
}));
