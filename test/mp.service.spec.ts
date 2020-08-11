import { MpService } from "../src/services/mp.service";
import { Test } from "@nestjs/testing";
import { MpModule } from "../src/mp.module";
import { join } from "path";
import { readFileSync } from "fs";

describe('MpService', () => {
  let mpService: MpService;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [MpModule.forRoot({
        appId: '',
        appSecret: '',
      })]
    }).compile();
    await testModule.init();
    mpService = testModule.get<MpService>(MpService);
  });

  describe('检查敏感图片', () => {
    it('成功', async () => {
      const media = readFileSync(join(__dirname, './images/normal.jpg'))
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true)
      expect(security).toBe(true)
      expect(errorMessage).toBeUndefined()
    })

    it('法轮功', async () => {
      const media = readFileSync(join(__dirname, './images/reactionary.jpeg'))
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true)
      expect(security).toBe(false)
      expect(errorMessage.includes('risky content')).toBeTruthy()
    })
    
    it('性感', async () => {
      const media = readFileSync(join(__dirname, './images/sexy.jpeg'))
      const { success, security, errorMessage } = await mpService.imageSecurityCheck(media);
      expect(success).toBe(true)
      expect(security).toBe(true)
      expect(errorMessage).toBeUndefined()
    })
  })
})