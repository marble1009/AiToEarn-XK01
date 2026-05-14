import { AIMessageChunk, BaseMessage } from '@langchain/core/messages'
import { ChatOpenAI, OpenAIChatInput } from '@langchain/openai'
import { Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { NvidiaConfig } from './nvidia.config'

@Injectable()
export class NvidiaService {
  private readonly logger = new Logger(NvidiaService.name)
  private readonly openAI: OpenAI
  private readonly chatOpenAI: ChatOpenAI

  constructor(
    private readonly config: NvidiaConfig,
  ) {
    this.openAI = this._createOpenAIClient()
    this.chatOpenAI = this._createChatModel({})
  }

  private _createOpenAIClient(): OpenAI {
    return new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    })
  }

  private _createChatModel(options: Partial<OpenAIChatInput>): ChatOpenAI {
    return new ChatOpenAI({
      ...options,
      maxRetries: 1,
      timeout: options.timeout ?? this.config.timeout,
      apiKey: options.apiKey ?? this.config.apiKey,
      configuration: {
        baseURL: this.config.baseUrl,
      },
      streaming: true,
    })
  }

  async createChatCompletionStream(options: Partial<OpenAIChatInput> & {
    model: string
    messages: BaseMessage[]
  }) {
    const {
      messages,
    } = options

    const chatModel = this._createChatModel(options)
    return await chatModel.stream(messages, options)
  }

  async createRawStream(options: OpenAI.Chat.ChatCompletionCreateParamsStreaming) {
    return this.openAI.chat.completions.create(options)
  }

  async createChatCompletion(options: Partial<OpenAIChatInput> & {
    model: string
    messages: BaseMessage[]
  }): Promise<AIMessageChunk> {
    const stream = await this.createChatCompletionStream(options)
    let result: AIMessageChunk | undefined

    for await (const chunk of stream) {
      if (result) {
        result = result.concat(chunk)
      }
      else {
        result = chunk
      }
    }

    return result!
  }
}
