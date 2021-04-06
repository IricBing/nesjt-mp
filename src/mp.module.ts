import { Module, DynamicModule, Global, HttpModule } from '@nestjs/common';
import { IConfig } from './interfaces/config.interface';
import { MpService } from './services/mp.service';
import { ConfigProvider, AccessTokenConfigProvider } from './constants/common.constant';
import { MpUtil } from './utils/mp.util';
import { IricUtil } from './utils/iric.util';
import { AccessTokenConfig } from './interfaces/access-token.interface';

@Global()
@Module({})
export class MpModule {
  static forRoot(config: IConfig): DynamicModule {
    const accessTokenConfig: AccessTokenConfig = {
      AccessToken: '',
      ExpiresAt: null
    };
    return {
      module: MpModule,
      imports: [HttpModule],
      providers: [MpUtil, MpService, IricUtil, { provide: ConfigProvider, useValue: config }, { provide: AccessTokenConfigProvider, useValue: accessTokenConfig }],
      exports: [MpService]
    };
  }
}
