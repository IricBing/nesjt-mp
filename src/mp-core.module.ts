import { DynamicModule, Global, HttpModule, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Redis } from 'ioredis';
import { ACCESS_TOKEN_CONFIG_PROVIDER, OPTIONS_PROVIDER, REDIS_CLIENT_PROVIDER } from './constants/common.constant';
import { MpModuleAsyncOptions, MpModuleOptions, MpOptionsFactory } from './interfaces/options.interface';
import { createRedisClientProvider } from './providers/redis-client.provider';
import { MpService } from './services/mp.service';
import { IricUtil } from './utils/iric.util';
import { MpUtil } from './utils/mp.util';

@Global()
@Module({})
export class MpCoreModule implements OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * 同步方式配置
   * @param options 配置信息
   * @returns 动态模块
   */
  static forRoot(options: MpModuleOptions): DynamicModule {
    return {
      module: MpCoreModule,
      imports: [HttpModule],
      providers: [
        MpUtil,
        MpService,
        IricUtil,
        createRedisClientProvider(),
        { provide: OPTIONS_PROVIDER, useValue: options },
        { provide: ACCESS_TOKEN_CONFIG_PROVIDER, useValue: { AccessToken: '', ExpiresAt: null } }
      ],
      exports: [MpService]
    };
  }

  /**
   * 异步方式配置
   * @param options 配置信息
   * @returns 动态模块
   */
  static forRootAsync(options: MpModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: MpCoreModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [...asyncProviders, MpUtil, MpService, IricUtil, createRedisClientProvider(), { provide: ACCESS_TOKEN_CONFIG_PROVIDER, useValue: { AccessToken: '', ExpiresAt: null } }],
      exports: [MpService]
    };
  }

  /**
   * 创建异步Provider列表
   * @param options 异步配置
   * @returns Provider列表
   */
  private static createAsyncProviders(options: MpModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass
      }
    ];
  }

  /**
   * 创建异步Provider
   * @param options 异步配置
   * @returns Provider
   */
  private static createAsyncOptionsProvider(options: MpModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OPTIONS_PROVIDER,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    const inject = [options.useClass || options.useExisting];
    return {
      provide: OPTIONS_PROVIDER,
      useFactory: async (optionsFactory: MpOptionsFactory) => await optionsFactory.createMpOptions(),
      inject
    };
  }

  onModuleDestroy() {
    const redisClient = this.moduleRef.get<Redis>(REDIS_CLIENT_PROVIDER);
    if (redisClient) redisClient.disconnect();
  }
}
