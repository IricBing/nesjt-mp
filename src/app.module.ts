import { Module, Global } from "@nestjs/common";
import { MpModule } from "./mp.module";

@Global()
@Module({
  imports: [
    MpModule.forRoot({
      appId: 'hello',
      appSecret: 'word'
    })
  ],
})
export class AppModule { }