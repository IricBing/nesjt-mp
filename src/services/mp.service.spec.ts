import { Test } from '@nestjs/testing';
import { join } from 'path';
import { readFileSync } from 'fs';
import { INestApplication } from '@nestjs/common';
import { MpService } from './mp.service';
import { MpModule } from '../mp.module';
import { ConfigModule } from '../../test/modules/config/config.module';
import { CONFIG_PROVIDER } from '../../test/modules/config/constants/config.constant';
import { ConfigService } from '../../test/modules/config/services/config.service';

describe('MpService', () => {
  let app: INestApplication;
  let mpService: MpService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MpModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            appId: configService.mp.appId,
            appSecret: configService.mp.appSecret,
            redisOptions: configService.redis.mp
          }),
          inject: [CONFIG_PROVIDER]
        }),
        ConfigModule
      ]
    }).compile();
    app = moduleFixture.createNestApplication();
    mpService = moduleFixture.get<MpService>(MpService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('检查敏感图片', () => {
    it('合法图片', async () => {
      const media = readFileSync(join(__dirname, './images/normal.jpg'));
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true);
      expect(security).toBe(true);
      expect(errorMessage).toBeUndefined();
    });

    it('法轮功', async () => {
      const media = readFileSync(join(__dirname, './images/reactionary.jpeg'));
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true);
      expect(security).toBe(false);
      expect(errorMessage.includes('risky content')).toBeTruthy();
    });

    it('性感', async () => {
      const media = readFileSync(join(__dirname, './images/sexy.jpeg'));
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true);
      expect(security).toBe(true);
      expect(errorMessage).toBeUndefined();
    });
  });

  describe('检查敏感文本', () => {
    it('合法文本', async () => {
      const { success, security, errorMessage } = await mpService.messageSecurityCheck('hello word');
      expect(success).toBe(true);
      expect(security).toBe(true);
      expect(errorMessage).toBeUndefined();
    });

    it('非法文本', async () => {
      const { success, security, errorMessage } = await mpService.messageSecurityCheck('特3456书yuuo莞6543李zxcz蒜7782法fgnv级');
      expect(success).toBe(true);
      expect(security).toBe(false);
      expect(errorMessage.includes('risky content')).toBeTruthy();
    });
  });
});
