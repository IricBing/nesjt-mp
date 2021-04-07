import { Module } from '@nestjs/common';
import { MpModule } from '../src/mp.module';
import { ConfigModule } from './modules/config/config.module';
import { CONFIG_PROVIDER } from './modules/config/constants/config.constant';
import { ConfigService } from './modules/config/services/config.service';

@Module({
  imports: [
    MpModule.forRoot({
      appId: '你的appId',
      appSecret: '你的appSecret'
    }),
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
})
export class AppModule {}
