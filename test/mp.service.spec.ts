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
    it('合法图片', async () => {
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

  describe('检查敏感文本', () => {
    it('合法文本', async () => {
      const { success, security, errorMessage } = await mpService.messageSecurityCheck("hello word");
      expect(success).toBe(true)
      expect(security).toBe(true)
      expect(errorMessage).toBeUndefined()
    })

    it('非法文本', async () => {
      const { success, security, errorMessage } = await mpService.messageSecurityCheck("特3456书yuuo莞6543李zxcz蒜7782法fgnv级");
      expect(success).toBe(true)
      expect(security).toBe(false)
      expect(errorMessage.includes('risky content')).toBeTruthy()
    })
  })
})