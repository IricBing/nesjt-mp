import { Module } from '@nestjs/common';
import { MpModule } from '../src/mp.module';
import { ConfigModule } from './modules/config/config.module';
import { CONFIG_PROVIDER } from './modules/config/constants/config.constant';
import { ConfigService } from './modules/config/services/config.service';

@Module({
  imports: [
    // MpModule.forRoot({
    //   appId: 'wxb5ebf49003e967e3',
    //   appSecret: 'bef0e14dffbd86e74d4ba9f8d9b9f1fb'
    // }),
    MpModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        appId: 'wxb5ebf49003e967e3',
        appSecret: 'bef0e14dffbd86e74d4ba9f8d9b9f1fb',
        redisOptions: configService.redis.mp
      }),
      inject: [CONFIG_PROVIDER]
    }),
    ConfigModule
  ]
})
export class AppModule {}
