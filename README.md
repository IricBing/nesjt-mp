# `nestjs` 小程序插件

注意：<font color="#dd0000">仍在开发中，目前仅在内部使用</font><br /> 

## 使用说明

外部人员仅供参考，请不要用于生产环境，因此导致的事故后果请自行承担。

### 支持环境

* node >=`14.x`

### 安装

``` shell
$ npm i @lantsang/nestjs-mp

or
$ yarn add @lantsang/nestjs-mp  # 推荐使用yarn
```

### 配置

#### 同步方式

``` typescript
import { Module } from '@nestjs/common';
import { MpModule } from '@lantsang/nestjs-mp'

@Module({
  imports: [
    MpModule.forRoot({
      appId: '小程序appid', 
      appSecret: '小程序app secret',
      redisOptions: {   // redisOptions 参数选填
        host:'localhost',
        port:6379,
        db:1,
        password:'',
        keyPrefix:'mp-'
      }
    })
  ]
})
export class AppModule { }
```

#### 异步方式

``` typescript
import { Module } from '@nestjs/common';
import { MpModule } from '@lantsang/nestjs-mp'
import { ConfigModule } from './modules/config/config.module';
import { CONFIG_PROVIDER } from './modules/config/constants/config.constant';
import { ConfigService } from './modules/config/services/config.service';

@Module({
  imports: [
    MpModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        appId: configService.mp.appId,
        appSecret: configService.mp.appSecret,
        redisOptions: configService.redis.mp  // redisOptions 参数选填
      }),
      inject: [CONFIG_PROVIDER]
    }),
    ConfigModule
  ]
})
export class AppModule { }
```

> 提示：异步注册方式采用的 `ConfigModule` 并不是 `NestJS` 自带的配置功能，而是我基于官方自己设计的一套，具体实现请参考笔记：[NestJS配置模块设计](https://github.com/IricBing/note/blob/master/NodeJS/NestJS/%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1/%E9%85%8D%E7%BD%AE%E6%A8%A1%E5%9D%97%E8%AE%BE%E8%AE%A1/README.md)

### 小程序登录

``` typescript
import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LantUtil } from "../../../utils/lant.util";
import { SystemLogAppender } from "../../log/constants/log.constant";
import { LogService } from "../../log/services/log.service";
import { LoginMpReqDto } from "../dtos/mp/login.mp.req.dto";
import { LoginMpResDto } from "../dtos/mp/login.mp.res.dto";
import { MpService } from "@lantsang/nestjs-mp";

@ApiTags('user')
@Controller('mp/users')
export class UserMpController {
  constructor(
    private readonly mpService: MpService,
    private readonly logService: LogService,
    private readonly lantUtil: LantUtil
  ) { }

  @ApiOperation({ summary: '小程序用户登录' })
  @ApiOkResponse({ description: '用户token信息', type: LoginMpResDto })
  @Post('login')
  async login(@Body() body: LoginMpReqDto) {
    try {
      const { success, userInfo, errorMessage } = await this.mpService.login(body.temp_code, body.raw_data, body.signature, body.encrypted_data, body.iv);

      console.log(success, userInfo, errorMessage)
      return 'hello world';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logService.fatal(SystemLogAppender.User, `Mp user login by ${JSON.stringify(body)} failed and error is ${error}`, this.lantUtil.parseError(error));
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

### 特殊说明

* 登录时，小程序模拟器第一次调用会出现签名校验失败的错误，之后都是正常的，因此在调用login的接口中最后一个参数为默认参数，默认检查签名，可设置为false不去校验。
