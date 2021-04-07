import { Module, DynamicModule } from '@nestjs/common';
import { MpModuleAsyncOptions, MpModuleOptions } from './interfaces/options.interface';
import { MpCoreModule } from './mp-core.module';

@Module({})
export class MpModule {
  /**
   * 同步方式配置
   * @param options 配置信息
   * @returns 动态模块
   */
  static forRoot(options: MpModuleOptions): DynamicModule {
    return {
      module: MpModule,
      imports: [MpCoreModule.forRoot(options)]
    };
  }

  /**
   * 异步方式配置
   * @param options 配置信息
   * @returns 动态模块
   */
  static forRootAsync(options: MpModuleAsyncOptions): DynamicModule {
    return {
      module: MpModule,
      imports: [MpCoreModule.forRootAsync(options)]
    };
  }
}
