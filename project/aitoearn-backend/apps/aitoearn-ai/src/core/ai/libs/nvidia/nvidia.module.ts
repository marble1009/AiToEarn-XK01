import { DynamicModule, Module } from '@nestjs/common'
import { NvidiaConfig } from './nvidia.config'
import { NvidiaService } from './nvidia.service'

@Module({})
export class NvidiaModule {
  static forRoot(config: NvidiaConfig): DynamicModule {
    return {
      module: NvidiaModule,
      providers: [
        {
          provide: NvidiaConfig,
          useValue: config,
        },
        NvidiaService,
      ],
      exports: [NvidiaService],
    }
  }
}
