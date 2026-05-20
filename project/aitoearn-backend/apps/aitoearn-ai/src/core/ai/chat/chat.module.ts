import { Module } from '@nestjs/common'
import { config } from '../../../config'
import { NvidiaModule } from '../libs/nvidia'
import { ModelsConfigModule } from '../models-config'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
  imports: [
    ModelsConfigModule,
    NvidiaModule.forRoot(config.ai.nvidia),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}
