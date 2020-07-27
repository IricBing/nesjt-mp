import { Module, DynamicModule, Global, HttpModule } from "@nestjs/common";
import { IConfig } from "./interfaces/config.interface";
import { MpService } from "./services/mp.service";
import { ConfigProvider } from "./constants/common.constant";
import { MpUtil } from "./utils/mp.util";
import { IricUtil } from "./utils/iric.util";

@Global()
@Module({})
export class MpModule {
	static forRoot(config: IConfig): DynamicModule {
		return {
			module: MpModule,
			imports: [HttpModule],
			providers: [
				MpUtil,
				MpService,
				IricUtil,
				{ provide: ConfigProvider, useValue: config },
			],
			exports: [
				MpService
			]
		};
	}
}