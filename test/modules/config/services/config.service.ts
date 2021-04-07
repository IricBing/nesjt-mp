import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { RedisModuleOptions } from 'nestjs-redis';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  /** redis数据库配置 */
  get redis() {
    return {
      /** mp存储数据库配置 */
      mp: this.redisMpConfig()
    };
  }

  private redisMpConfig(): RedisModuleOptions {
    return {
      /** 自定义服务名称 */
      name: this.nestConfigService.get<string>('redis.mp.name'),
      /** 数据库Host */
      host: this.nestConfigService.get<string>('redis.mp.host'),
      /** 数据库端口 */
      port: this.nestConfigService.get<number>('redis.mp.port'),
      /** 数据库编号0-15 */
      db: this.nestConfigService.get<number>('redis.mp.db'),
      /** 登录密码 */
      password: this.nestConfigService.get<string>('redis.mp.password'),
      /** Key前缀 */
      keyPrefix: this.nestConfigService.get<string>('redis.mp.keyPrefix')
    };
  }
}
