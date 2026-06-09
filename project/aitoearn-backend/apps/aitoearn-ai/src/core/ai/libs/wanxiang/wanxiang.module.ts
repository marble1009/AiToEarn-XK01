import { Global, Module } from '@nestjs/common'
import { WanxiangService } from './wanxiang.service'

@Global()
@Module({
  providers: [WanxiangService],
  exports: [WanxiangService],
})
export class WanxiangModule {}
