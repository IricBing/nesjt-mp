import { Test } from '@nestjs/testing';
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
    mpService = moduleFixture.get(MpService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
});
