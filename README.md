# nestjs 小程序插件
注意：<font color="#dd0000">仍在开发中，目前仅在内部使用</font><br /> 

## 使用说明
外部人员仅供参考，请不要用于生产环境，因此导致的事故后果请自行承担。

### 安装
`$ npm i @lantsang/nestjs-mp` <br />
or <br />
`$ yarn add @lantsang/nestjs-mp`<br />
推荐使用yarn

### 配置
```typescript
import { MpModule } from '@lantsang/nestjs-mp'

@Module({
  imports: [
    MpModule.forRoot({
      appId: config.MiniProgram.AppId, // 小程序appid
      appSecret: config.MiniProgram.AppSecret //小程序app secret
    })
  ]
})
export class AppModule { }
```

### 小程序登录
```typescript
import { Body, Controller, HttpStatus, Post, HttpStatus, HttpException } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from 'express';
import { LantUtil } from "../../../utils/lant.util";
import { SystemLogAppender } from "../../log/constants/log.constant";
import { LogService } from "../../log/services/log.service";
import { LoginMpReqDto } from "../dtos/mp/login.mp.req.dto";
import { LoginMpResDto } from "../dtos/mp/login.mp.res.dto";
import { MpService } from "@iricbing/nestjs-mp";

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
  async login(@Body() body: LoginMpReqDto):Promise<LoginMpResDto> {
    try {
      const { success, userInfo, errorMessage } = await this.mpService.login(body.temp_code, body.raw_data, body.signature, body.encrypted_data, body.iv);

      console.log(success, userInfo, errorMessage)
      return null;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logService.fatal(SystemLogAppender.user, `Mp user login by ${JSON.stringify(body)} failed and error is ${error}` , this.lantUtil.parseError(error));
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

### 特殊说明
- 登录时，小程序模拟器第一次调用会出现签名校验失败的错误，之后都是正常的，因此在调用login的接口中最后一个参数为默认参数，默认检查签名，可设置为false不去校验。