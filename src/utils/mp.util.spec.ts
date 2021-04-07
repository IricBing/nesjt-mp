import { Test } from '@nestjs/testing';
import { MpUtil } from './mp.util';
import { INestApplication } from '@nestjs/common';
import { MpModule } from '../mp.module';
import { ConfigModule } from '../../test/modules/config/config.module';
import { CONFIG_PROVIDER } from '../../test/modules/config/constants/config.constant';
import { ConfigService } from '../../test/modules/config/services/config.service';

describe('MpUtil (async)', () => {
  let app: INestApplication;
  let mpUtil: MpUtil;

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
    mpUtil = moduleFixture.get<MpUtil>(MpUtil);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('获取access token', () => {
    it('成功', async () => {
      const accessToken = await mpUtil.getAccessToken();
      expect(accessToken).toBeTruthy();
    });
  });
});
