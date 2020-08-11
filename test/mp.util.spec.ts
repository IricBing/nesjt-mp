import { Test } from '@nestjs/testing';
import { MpUtil } from "../src/utils/mp.util";
import { MpModule } from '../src/mp.module';

describe('AliExpressService', () => {
  let mpUtil: MpUtil;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [MpModule.forRoot({
        appId: '',
        appSecret: '',
      })]
    }).compile();
    await testModule.init();
    mpUtil = testModule.get<MpUtil>(MpUtil);
  });

  describe('获取access token', () => {
    it('成功', async () => {
      const accessToken = await mpUtil.getAccessToken();
      expect(accessToken).toBeTruthy()
    })
  })
})