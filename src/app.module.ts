import { Module, Global } from '@nestjs/common';
import { MpModule } from './mp.module';

@Global()
@Module({
  imports: [
    MpModule.forRoot({
      appId: 'wxb5ebf49003e967e3',
      appSecret: 'bef0e14dffbd86e74d4ba9f8d9b9f1fb'
    })
  ]
})
export class AppModule {}
