import { ModuleMetadata, Type } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

/** 同步传入配置 */
export interface MpModuleOptions {
  /** 小程序appid */
  appId: string;

  /** 小程序app secret */
  appSecret: string;

  /** Redis配置 */
  redisOptions?: RedisOptions;
}

export interface MpOptionsFactory {
  createMpOptions(): MpModuleOptions | Promise<MpModuleOptions>;
}

/** 异步传入配置 */
export interface MpModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MpOptionsFactory>;
  useClass?: Type<MpOptionsFactory>;
  useFactory?: (...args: any[]) => MpModuleOptions | Promise<MpModuleOptions>;
  inject?: any[];
}
