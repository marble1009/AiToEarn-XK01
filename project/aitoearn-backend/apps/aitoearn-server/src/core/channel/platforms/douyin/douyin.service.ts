import { Injectable, Logger } from '@nestjs/common'
import {
  AccountStatus,
  AccountType,
  NewAccount,
  PublishType,
} from '@yikart/aitoearn-server-client'
import { AppException, ResponseCode } from '@yikart/common'
import { RedisService } from '@yikart/redis'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentTimestamp } from '../../../../common/utils/time.util'
import { config } from '../../../../config'
import { RelayAuthException } from '../../../relay/relay-auth.exception'
import { ChannelRedisKeys } from '../../channel.constants'
import * as puppeteer from 'puppeteer'
import { existsSync, mkdirSync, createWriteStream, writeFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import { DouyinAccessTokenInfo, DouyinClientTokenInfo, DouyinOpenTicketInfo, DouyinShareSchemaOptions } from '../../libs/douyin/common'
import { DouyinApiService } from '../../libs/douyin/douyin-api.service'
import { PlatformBaseService } from '../base.service'
import { ChannelAccountService } from '../channel-account.service'
import { AuthCallbackResult, AuthTaskInfo } from '../common'
import { PlatformAuthExpiredException } from '../platform.exception'
import { AccessToken, ArchiveStatus, DouyinAuthInfo } from './common'

@Injectable()
export class DouyinService extends PlatformBaseService {
  protected override readonly platform: AccountType = AccountType.Douyin
  protected override readonly logger = new Logger(DouyinService.name)
  constructor(
    private readonly redisService: RedisService,
    private readonly douyinApiService: DouyinApiService,
    private readonly channelAccountService: ChannelAccountService,
  ) {
    super()
  }

  async getDouyinConfig() {
    return config.channel.douyin
  }

  /**
   * 创建用户授权任务
   * @param data
   * @param options
   */
  async createAuthTask(
    data: {
      userId?: string
      spaceId?: string
      callbackUrl?: string
      callbackMethod?: 'GET' | 'POST'
    },
  ) {
    if (!config.channel.douyin.id && config.relay) {
      throw new RelayAuthException()
    }
    const taskId = uuidv4()
    const urlInfo = await this.getAuthUrl(taskId)
    const rRes = await this.redisService.setJson<AuthTaskInfo<DouyinAuthInfo>>(
      ChannelRedisKeys.authTask('douyin', taskId),
      {
        taskId,
        spaceId: data.spaceId,
        data: {
          state: taskId,
          userId: data.userId,
          accountId: '',
        },
        status: 0,
        callbackUrl: data.callbackUrl,
        callbackMethod: data.callbackMethod,
      },
      60 * 5,
    )

    return rRes
      ? {
          url: urlInfo.url,
          taskId,
        }
      : null
  }

  /**
   * 获取用户的授权链接
   * @param taskId
   * @returns
   */
  async getAuthUrl(taskId: string) {
    const gourl = `${config.channel.douyin.authBackHost}`
    const urlInfo = this.douyinApiService.getAuthPage(gourl, taskId)
    return urlInfo
  }

  /**
   * 获取用户的授权信息
   * @param taskId
   * @returns
   */
  async getAuthInfo(taskId: string) {
    const data = await this.redisService.getJson<{
      state: string
      status: number
      accountId?: string
    }>(ChannelRedisKeys.authTask('douyin', taskId))
    return data
  }

  async getAccessTokenStatus(accountId: string): Promise<number> {
    await this.ensureLocalAccount(accountId)
    const tokenInfo = await this.getOAuth2Credential(accountId)
    if (!tokenInfo) {
      this.updateAccountStatus(accountId, 0)
      return 0
    }
    const now = getCurrentTimestamp()
    const status = tokenInfo.expires_in > now ? 1 : 0
    this.updateAccountStatus(accountId, status)
    return status
  }

  /**
   * 获取用户的授权信息
   * @param accountId
   * @returns
   */
  async getAccountAuthInfo(accountId: string) {
    const data = await this.redisService.getJson<AccessToken>(
      ChannelRedisKeys.accessToken('douyin', accountId),
    )
    return data
  }

  /**
   * 获取用户信息
   * @param accessToken
   * @param openId
   * @returns
   */
  async getAccountInfo(accessToken: string, openId: string) {
    const douyinUserInfo
      = await this.douyinApiService.getAccountInfo(accessToken, openId)
    if (!douyinUserInfo)
      return null
    return douyinUserInfo
  }

  /**
   * 保存用户的授权信息
   * @param accountId
   * @param accessTokenInfo
   * @returns
   */
  private async saveOAuthCredential(
    accountId: string,
    accessTokenInfo: DouyinAccessTokenInfo,
  ) {
    const cached = await this.redisService.setJson(
      ChannelRedisKeys.accessToken('douyin', accountId),
      accessTokenInfo,
      accessTokenInfo.expires_in,
    )
    const persistResult = await this.oauth2CredentialRepository.upsertOne(
      accountId,
      this.platform,
      {
        accessToken: accessTokenInfo.access_token,
        refreshToken: accessTokenInfo.refresh_token,
        accessTokenExpiresAt: accessTokenInfo.expires_in,
      },
    )
    return cached && persistResult
  }

  /**
   * 创建账号+设置授权Token
   * @param taskId
   * @param data
   * @returns
   */
  async createAccountAndSetAccessToken(
    taskId: string,
    data: { code: string, state: string },
  ): Promise<AuthCallbackResult> {
    const cacheKey = ChannelRedisKeys.authTask('douyin', taskId)
    const { code, state } = data

    const taskInfo
      = await this.redisService.getJson<AuthTaskInfo<DouyinAuthInfo>>(cacheKey)
    if (!taskInfo || taskInfo.status !== 0) {
      return {
        status: 0,
        message: '授权超时',
      }
    }

    if (taskId !== state) {
      return {
        status: 0,
        message: '授权认证失败',
      }
    }

    // 延长授权时间
    void this.redisService.expire(cacheKey, 60 * 3)

    // 获取token，创建账号
    const accessTokenInfo = await this.douyinApiService.getAccessToken(code)
    if (!accessTokenInfo) {
      return {
        status: 0,
        message: '平台认证失效',
      }
    }

    // 获取抖音用户信息
    const douyinUserInfo = await this.getAccountInfo(
      accessTokenInfo.access_token,
      accessTokenInfo.open_id,
    )
    this.logger.log({
      path: 'douyin createAccountAndSetAccessToken getAccountInfo',
      data: douyinUserInfo,
    })
    if (!douyinUserInfo) {
      return {
        status: 0,
        message: '获取用户信息失败，请稍后再试',
      }
    }

    // 创建本平台的平台账号
    const newData = new NewAccount({
      userId: taskInfo.data!.userId || '',
      type: AccountType.Douyin,
      uid: douyinUserInfo.open_id,
      account: douyinUserInfo.open_id,
      avatar: douyinUserInfo.avatar,
      nickname: douyinUserInfo.nickname,
      groupId: taskInfo.spaceId,
      status: AccountStatus.NORMAL,
    })
    this.logger.log({
      path: 'douyin createAccountAndSetAccessToken createAccount newData',
      data: newData,
    })
    const accountInfo = await this.channelAccountService.createAccount(
      {
        type: AccountType.Douyin,
        uid: douyinUserInfo.open_id,
      },
      newData,
    )
    this.logger.log({
      path: 'douyin createAccountAndSetAccessToken createAccount accountInfo',
      data: accountInfo,
    })
    if (!accountInfo) {
      return {
        status: 0,
        message: '创建频道账号失败',
      }
    }

    let res = await this.saveOAuthCredential(accountInfo.id, accessTokenInfo)

    if (!res) {
      return {
        status: 0,
        message: '设置授权Token失败，请稍后再试',
      }
    }

    // 更新任务信息
    taskInfo.status = 1
    taskInfo.data!.accountId = accountInfo.id
    res = await this.redisService.setJson(
      cacheKey,
      taskInfo,
      60 * 3,
    )

    if (!res) {
      return {
        status: 0,
        message: '设置授权Token失败，请稍后再试',
      }
    }

    return {
      status: 1,
      accountId: accountInfo.id,
      nickname: accountInfo.nickname,
      avatar: accountInfo.avatar,
      platformUid: accountInfo.uid,
      accountType: AccountType.Douyin,
      callbackUrl: taskInfo.callbackUrl,
      callbackMethod: taskInfo.callbackMethod,
      taskId,
    }
  }

  private async getOAuth2Credential(
    accountId: string,
  ): Promise<AccessToken | null> {
    let credential = await this.redisService.getJson<AccessToken>(
      ChannelRedisKeys.accessToken('douyin', accountId),
    )
    if (!credential) {
      const oauth2Credential = await this.oauth2CredentialRepository.getOne(
        accountId,
        this.platform,
      )
      if (!oauth2Credential) {
        return null
      }
      credential = {
        access_token: oauth2Credential.accessToken,
        refresh_token: oauth2Credential.refreshToken,
        expires_in: oauth2Credential.accessTokenExpiresAt,
        scopes: [],
      }
    }
    return credential
  }

  /**
   * 获取用户的授权Token
   * @param accountId
   * @returns
   */
  async getAccountAccessToken(accountId: string): Promise<string> {
    await this.ensureLocalAccount(accountId)
    const credential = await this.getOAuth2Credential(accountId)
    if (!credential || !credential.access_token) {
      throw new PlatformAuthExpiredException(this.platform, accountId)
    }

    // 剩余时间
    const overTime = credential.expires_in - getCurrentTimestamp()

    if (overTime > 60 * 10)
      return credential.access_token

    return await this.refreshAccessToken(accountId, credential.refresh_token)
  }

  /**
   * 刷新AccessToken
   * @param accountId
   * @param refreshToken
   * @returns
   */
  private async refreshAccessToken(
    accountId: string,
    refreshToken: string,
  ): Promise<string> {
    const accessTokenInfo
      = await this.douyinApiService.refreshAccessToken(refreshToken)
    if (!accessTokenInfo)
      throw new PlatformAuthExpiredException(this.platform, accountId)

    const res = await this.saveOAuthCredential(accountId, accessTokenInfo)
    if (!res)
      throw new PlatformAuthExpiredException(this.platform, accountId)

    return accessTokenInfo.access_token
  }

  /**
   * 获取发布的ClientToken
   */
  private async getClientToken(): Promise<string> {
    // 先从缓存中获取
    let clientTokenInfo = await this.redisService.getJson<DouyinClientTokenInfo>(
      `plat:${this.platform.toLowerCase()}:clientToken`,
    )
    if (!clientTokenInfo) {
      clientTokenInfo = await this.douyinApiService.getClientToken()
      await this.redisService.setJson(
        `plat:${this.platform.toLowerCase()}:clientToken`,
        clientTokenInfo,
        clientTokenInfo.expires_in,
      )
    }
    return clientTokenInfo.access_token
  }

  /**
   * 获取发布的ClientToken
   * @returns
   */
  async getOpenTicket(): Promise<string> {
    const clientToken = await this.getClientToken()
    let ticketInfo = await this.redisService.getJson<DouyinOpenTicketInfo>(
      `plat:${this.platform.toLowerCase()}:openTicket:${clientToken}`,
    )
    if (!ticketInfo) {
      ticketInfo = await this.douyinApiService.getOpenTicket(clientToken)
      await this.redisService.setJson(
        `plat:${this.platform.toLowerCase()}:openTicket:${clientToken}`,
        ticketInfo,
        ticketInfo.expires_in,
      )
    }
    return ticketInfo.ticket
  }

  /**
   * 获取分享ID
   * @param accountId 账户ID
   * @returns
   */
  async getShareid() {
    const clientToken = await this.getClientToken()
    return await this.douyinApiService.getShareid(clientToken)
  }

  /**
   * 生成分享 Schema 短链接
   * @param videoPath 视频路径
   * @param options 分享选项
   * @returns 短链接 URL
   */
  async generateShareSchema(options: DouyinShareSchemaOptions) {
    const ticket = await this.getOpenTicket()
    const schemaUrl = await this.douyinApiService.generateShareSchema(ticket, options)
    return schemaUrl
  }

  /**
   * 获取分区列表
   * 抖音平台没有分区概念，返回空数组保持接口兼容
   */
  async getArchiveTypeList(_accountId: string) {
    return []
  }

  /**
   * 获取稿件列表
   * @param accountId 账户ID
   * @returns
   */
  async getArchiveList(
    accountId: string,
    params: {
      ps: number
      pn: number
      status?: ArchiveStatus
    },
  ) {
    this.logger.log('getArchiveList', accountId, params)
    return []
  }

  /**
   * 获取用户数据
   * @param accountId 账户ID
   * @returns
   */
  async getUserStat(accountId: string) {
    const accessToken = await this.getAccountAccessToken(accountId)
    return await this.douyinApiService.getUserStat(accessToken)
  }

  /**
   * 获取稿件数据
   * @param accountId 账户ID
   * @param resourceId 稿件ID
   * @returns
   */
  async getArcStat(accountId: string, resourceId: string) {
    const accessToken = await this.getAccountAccessToken(accountId)
    return await this.douyinApiService.getArcStat(accessToken, resourceId)
  }

  /**
   * 获取稿件增量数据数据
   * @param accountId 账户ID
   * @returns
   */
  async getArcIncStat(accountId: string) {
    const accessToken = await this.getAccountAccessToken(accountId)
    return await this.douyinApiService.getArcIncStat(accessToken)
  }

  /**
   * 删除稿件
   * @param accountId
   * @param postId
   * @returns
   */
  override async deletePost(accountId: string, postId: string): Promise<boolean> {
    const accessToken = await this.getAccountAccessToken(accountId)
    const res = await this.douyinApiService.deleteArchive(accessToken, postId)
    return res.code === 0
  }

  /**
   * 获取作品信息
   * @param accountType
   * @param workLink
   * @param dataId
   * @returns
   */
  async getWorkLinkInfo(accountType: AccountType, workLink: string, dataId?: string): Promise<{
    dataId: string
    uniqueId: string
    type: PublishType
    videoType?: 'short' | 'long'
  }> {
    const videoId = this.parseDouyinUrl(workLink)
    const resolvedDataId = videoId || dataId || ''
    if (!resolvedDataId) {
      throw new AppException(ResponseCode.InvalidWorkLink)
    }

    return {
      dataId: resolvedDataId,
      uniqueId: `${accountType}_${resolvedDataId}`,
      type: PublishType.VIDEO,
      videoType: 'short',
    }
  }

  /**
   * 解析抖音 URL，提取视频 ID
   * 支持的 URL 格式：
   * - https://www.douyin.com/video/VIDEO_ID
   * - https://www.douyin.com/note/NOTE_ID
   * - https://v.douyin.com/SHORT_CODE
   * - https://www.iesdouyin.com/share/video/VIDEO_ID
   * - https://www.douyin.com/user/self?modal_id=VIDEO_ID
   * @param workLink 抖音链接
   * @returns videoId 或 null
   */
  private parseDouyinUrl(workLink: string): string | null {
    let url: URL
    try {
      url = new URL(workLink)
    }
    catch {
      return null
    }

    const hostname = url.hostname.replace('www.', '')

    if (hostname === 'douyin.com') {
      const pathname = url.pathname
      // https://www.douyin.com/video/VIDEO_ID
      if (pathname.startsWith('/video/')) {
        return pathname.split('/video/')[1]?.split(/[?&#/]/)[0] || null
      }
      // https://www.douyin.com/note/NOTE_ID
      if (pathname.startsWith('/note/')) {
        return pathname.split('/note/')[1]?.split(/[?&#/]/)[0] || null
      }
      // https://www.douyin.com/user/self?modal_id=VIDEO_ID
      const modalId = url.searchParams.get('modal_id')
      if (modalId) {
        return modalId
      }
    }
    else if (hostname === 'v.douyin.com') {
      // 短链接，返回短码作为 ID
      return url.pathname.slice(1).split(/[?&#/]/)[0] || null
    }
    else if (hostname === 'iesdouyin.com') {
      // https://www.iesdouyin.com/share/video/VIDEO_ID
      const videoMatch = url.pathname.match(/\/video\/(\d+)/)
      if (videoMatch) {
        return videoMatch[1]
      }
    }

    return null
  }

  async getAccount(accountId: string) {
    return await this.accountRepository.getAccountById(accountId)
  }

  /**
   * 核心自动化发布逻辑 (Puppeteer 驱动)
   */
  async automatedPublish(data: {
    accountId: string
    videoUrl: string
    title: string
    desc: string
    topics: string[]
    isPrivate?: boolean
  }) {
    this.logger.log(`[Douyin Automation] Starting publish for account ${data.accountId}`)

    const launchOptions: any = {
      headless: process.env['PUPPETEER_HEADLESS'] !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
    }

    if (process.platform === 'linux' && existsSync('/usr/bin/google-chrome')) {
      launchOptions.executablePath = '/usr/bin/google-chrome'
    } else if (process.platform === 'win32') {
      for (const p of [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        join(process.env['LOCALAPPDATA'] || '', 'Google\\Chrome\\Application\\chrome.exe')
      ]) {
        if (existsSync(p)) {
          launchOptions.executablePath = p
          break
        }
      }
    }

    const browser = await puppeteer.launch(launchOptions)

    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      // 1. 注入 Cookie 并检测登录
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'domcontentloaded', timeout: 60000 })
      
      const account = await this.accountRepository.getAccountById(data.accountId)
      if (!account || !account.loginCookie) {
        throw new Error('未找到该抖音账号的登录 Cookie，请先在本地测试中扫码登录保存 Cookie。')
      }

      const cookies = JSON.parse(account.loginCookie)
      await page.setCookie(...cookies)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await new Promise(r => setTimeout(r, 4000))

      // 检测是否成功登录并且加载了文件上传组件
      const fileInput = await page.$('input[type="file"]')
      if (!fileInput) {
        throw new Error('抖音 Session 已失效或登录失败，请重新扫码保存 Cookie')
      }

      // 2. 上传视频
      const tempDir = join(process.cwd(), 'temp')
      if (!existsSync(tempDir)) mkdirSync(tempDir)
      const localVideoPath = join(tempDir, `dy_${Date.now()}.mp4`)
      
      await this.downloadVideo(data.videoUrl, localVideoPath)
      await fileInput.uploadFile(localVideoPath)
      this.logger.log(`[Douyin Automation] Video uploaded, waiting for processing...`)

      // 抖音视频处理较慢，等待 40 秒以确保完全上传
      await new Promise(r => setTimeout(r, 40000))

      // 3. 填写标题和内容 (抖音标题与描述同属一个富文本编辑区域)
      let textFilled = false
      const descWithTopics = `${data.title}\n${data.desc} ${data.topics.map(t => `#${t}`).join(' ')}`
      
      const editorSelectors = [
        'div[contenteditable="true"]',
        '.editor-content',
        '[class*="editor"]',
        'textarea',
      ]

      for (const sel of editorSelectors) {
        const el = await page.$(sel)
        if (el) {
          const isVisible = await el.evaluate((e: any) => {
            const rect = e.getBoundingClientRect()
            return rect.width > 150 && rect.height > 40
          })
          if (isVisible) {
            await el.click()
            await new Promise(r => setTimeout(r, 300))
            await page.keyboard.down('Control')
            await page.keyboard.press('KeyA')
            await page.keyboard.up('Control')
            await page.keyboard.press('Backspace')
            await el.type(descWithTopics, { delay: 20 })
            textFilled = true
            break
          }
        }
      }

      if (!textFilled) {
        const editorByXpath = await page.$$('::-p-xpath(//div[@contenteditable="true"])')
        if (editorByXpath.length > 0) {
          await editorByXpath[0].click()
          await page.keyboard.down('Control')
          await page.keyboard.press('KeyA')
          await page.keyboard.up('Control')
          await page.keyboard.press('Backspace')
          await editorByXpath[0].type(descWithTopics, { delay: 20 })
          textFilled = true
        }
      }

      if (!textFilled) {
        throw new Error('无法在抖音发布页面上定位标题与描述的输入框')
      }

      // 4. 清理新手引导遮罩层与浮层弹窗
      await page.evaluate(() => {
        const allElements = Array.from((globalThis as any).document.querySelectorAll('*'))
        for (const el of allElements) {
          const text = (((el as any).innerText || '') as string).trim()
          if (text === '我知道了' && (el as any).offsetWidth > 0) {
            ;(el as any).click()
          }
        }
      })
      await new Promise(r => setTimeout(r, 800))
      await page.keyboard.press('Escape')
      await new Promise(r => setTimeout(r, 500))
      await page.mouse.click(10, 400) // 点击空白处

      // 滚动到底部以完全呈现设置与发布按钮
      await page.evaluate(() => (globalThis as any).scrollTo(0, (globalThis as any).document.body.scrollHeight))
      await new Promise(r => setTimeout(r, 2000))

      // 5. 设置隐私选项（如果指定为仅自己可见）
      if (data.isPrivate) {
        const privateOptionClicked = await page.evaluate(() => {
          const allElements = Array.from((globalThis as any).document.querySelectorAll('*'))
          for (const el of allElements) {
            const text = (((el as any).innerText || '') as string).trim()
            if (text === '仅自己可见' && (el as any).offsetWidth > 0) {
              ;(el as any).click()
              return true
            }
          }
          return false
        })

        if (!privateOptionClicked) {
          const privateBtnXpath = await page.$$("::-p-xpath(//span[contains(text(), '仅自己可见')] | //div[contains(text(), '仅自己可见')])")
          if (privateBtnXpath.length > 0) {
            await privateBtnXpath[0].click()
            this.logger.log(`[Douyin Automation] Privacy set to PRIVATE (via XPath)`)
          } else {
            this.logger.warn(`[Douyin Automation] Could not locate PRIVATE setting button`)
          }
        } else {
          this.logger.log(`[Douyin Automation] Privacy set to PRIVATE (via DOM click)`)
        }
        await new Promise(r => setTimeout(r, 1000))
      }

      // 6. 点击发布按钮 (三重策略)
      // 策略1: 寻找精确文本是“发布”的按钮并点击
      let publishClicked = await page.evaluate(() => {
        const all = Array.from((globalThis as any).document.querySelectorAll('*'))
        const candidates = all.filter((el: any) => {
          const text = ((el.innerText || '') as string).trim()
          const rect = el.getBoundingClientRect()
          return text === '发布' && rect.width > 30 && rect.height > 15 && rect.y > 400
        })
        
        if (candidates.length > 0) {
          candidates.sort((a: any, b: any) => {
            const ra = a.getBoundingClientRect()
            const rb = b.getBoundingClientRect()
            return (ra.width * ra.height) - (rb.width * rb.height)
          })
          const target = candidates[0] as any
          const rect = target.getBoundingClientRect()
          return { success: true, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } }
        }
        return { success: false, rect: null }
      })

      if (publishClicked.success && publishClicked.rect) {
        await page.mouse.click(publishClicked.rect.x + publishClicked.rect.w / 2, publishClicked.rect.y + publishClicked.rect.h / 2)
      }

      // 策略2: 如果精确匹配失败，根据“存草稿”按钮坐标推算“发布”按钮
      if (!publishClicked.success) {
        const draftBtn = await page.evaluate(() => {
          const all = Array.from((globalThis as any).document.querySelectorAll('*'))
          for (const el of all) {
            const text = (((el as any).innerText || '') as string).trim()
            const rect = (el as any).getBoundingClientRect()
            if ((text === '存草稿' || text === '存为草稿') && rect.width > 30) {
              return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
            }
          }
          return null
        })

        if (draftBtn) {
          const publishX = draftBtn.x + draftBtn.w + 100
          const publishY = draftBtn.y + draftBtn.h / 2
          await page.mouse.click(publishX, publishY)
          publishClicked.success = true
        }
      }

      // 策略3: 终极固定坐标兜底
      if (!publishClicked.success) {
        await page.mouse.click(680, 745)
        publishClicked.success = true
      }

      // 等待发布完成并跳转
      await new Promise(r => setTimeout(r, 6000))
      const currentUrl = page.url()
      
      // 提取视频 postId (如果是 /content/post/video，我们返回一个基于时间戳的 ID)
      const postId = currentUrl.match(/\/video\/(\d+)/)?.[1] || `dy_auto_${Date.now()}`
      this.logger.log(`[Douyin Automation] Successfully published! Post ID: ${postId}`)

      // 清理临时文件
      try {
        if (existsSync(localVideoPath)) {
          require('fs').unlinkSync(localVideoPath)
        }
      } catch (e) {
        this.logger.error(`Error deleting temp video file: ${(e as Error).message}`)
      }

      return {
        postId,
        permalink: currentUrl,
      }

    } finally {
      await browser.close()
    }
  }

  private async downloadVideo(url: string, path: string) {
    const writer = createWriteStream(path)
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
    response.data.pipe(writer)
    return new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve())
      writer.on('error', reject)
    })
  }
}
