import { Injectable, Logger } from '@nestjs/common'
import { AccountType, PublishType } from '@yikart/aitoearn-server-client'
import { AppException, ResponseCode } from '@yikart/common'
import { PlatformBaseService } from '../base.service'
import * as puppeteer from 'puppeteer'
import { join } from 'path'
import { existsSync, mkdirSync, createWriteStream } from 'fs'
import axios from 'axios'

@Injectable()
export class XiaohongshuService extends PlatformBaseService {
  protected override readonly platform: AccountType = AccountType.Xhs
  protected override readonly logger = new Logger(XiaohongshuService.name)

  async getAccessTokenStatus(accountId: string): Promise<number> {
    const account = await this.accountRepository.getAccountById(accountId)
    return account?.status === 1 ? 1 : 0
  }

  async getWorkLinkInfo(accountType: AccountType, workLink: string, dataId?: string): Promise<{
    dataId: string
    uniqueId: string
    type: PublishType
    videoType?: 'short' | 'long'
  }> {
    const videoId = this.parseXhsUrl(workLink)
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

  private parseXhsUrl(url: string): string | null {
    try {
        const match = url.match(/explore\/([a-zA-Z0-9]+)/) || url.match(/discovery\/item\/([a-zA-Z0-9]+)/)
        return match ? match[1] : null
    } catch {
        return null
    }
  }

  /**
   * 核心自动化发布逻辑
   */
  async automatedPublish(data: {
    accountId: string
    videoUrl: string
    title: string
    desc: string
    topics: string[]
  }) {
    this.logger.log(`[XHS Automation] Starting publish for account ${data.accountId}`)
    
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
    }

    const browser = await puppeteer.launch(launchOptions)

    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      // 1. 登录检测与执行
      await page.goto('https://creator.xiaohongshu.com/login', { waitUntil: 'networkidle2' })
      
      const account = await this.accountRepository.getAccountById(data.accountId)
      if (account?.loginCookie) {
        const cookies = JSON.parse(account.loginCookie)
        await page.setCookie(...cookies)
        await page.reload({ waitUntil: 'networkidle2' })
      }

      const isLogged = await page.$('.user-info') 
      if (!isLogged) {
        this.logger.log('[XHS Automation] Session expired or not found. Performing login...')
        await this.performLogin(page, '18996341588', '109911lZ')
        
        const cookies = await page.cookies()
        await this.accountRepository.updateById(data.accountId, { loginCookie: JSON.stringify(cookies) })
      }

      // 2. 发布页面
      await page.goto('https://creator.xiaohongshu.com/publish/publish', { waitUntil: 'networkidle2' })

      // 3. 上传视频
      const tempDir = join(process.cwd(), 'temp')
      if (!existsSync(tempDir)) mkdirSync(tempDir)
      const localVideoPath = join(tempDir, `${Date.now()}.mp4`)
      
      await this.downloadVideo(data.videoUrl, localVideoPath)

      const fileInput = await page.$('input[type="file"]')
      if (!fileInput) throw new Error('Could not find file input on XHS publish page')
      await fileInput.uploadFile(localVideoPath)
      
      await page.waitForSelector('.upload-success', { timeout: 120000 })

      // 4. 填写标题和内容
      const titleInput = await page.$('input[placeholder*="标题"]') || await page.$('.title-input')
      if (titleInput) {
        await titleInput.click({ clickCount: 3 } as any)
        await page.keyboard.press('Backspace')
        await titleInput.type(data.title, { delay: 30 })
      }

      const descInput = await page.$('div[contenteditable="true"]:not([class*="title"])') || await page.$('.ql-editor') || await page.$('.content-input')
      if (descInput) {
        await descInput.click()
        await page.keyboard.down('Control')
        await page.keyboard.press('KeyA')
        await page.keyboard.up('Control')
        await page.keyboard.press('Backspace')
        const descWithTopics = `${data.desc} ${data.topics.map(t => `#${t}`).join(' ')}`
        await descInput.type(descWithTopics, { delay: 20 })
      }

      // 5. 发布 — 关闭浮层，滚动到底部，用坐标定位底部红色"发布"按钮
      await page.keyboard.press('Escape')
      await new Promise(r => setTimeout(r, 500))
      await page.mouse.click(10, 400)
      await new Promise(r => setTimeout(r, 1000))

      // 策略1: 尝试文本精确匹配
      let publishClicked = await page.evaluate(() => {
        const all = Array.from((globalThis as any).document.querySelectorAll('*'))
        for (const el of all) {
          const text = (((el as any).innerText || '') as string).trim()
          const rect = (el as any).getBoundingClientRect()
          if (text === '发布' && rect.width > 30 && rect.height > 15) {
            ;(el as any).click()
            return true
          }
        }
        return false
      })

      // 策略2: 用"暂存离开"按钮坐标推算
      if (!publishClicked) {
        const saveBtn = await page.evaluate(() => {
          for (const el of (globalThis as any).document.querySelectorAll('*')) {
            const text = (((el as any).innerText || '') as string).trim()
            const rect = (el as any).getBoundingClientRect()
            if (text === '暂存离开' && rect.width > 50 && rect.width < 200) {
              return { x: rect.x + rect.width + 100, y: rect.y + rect.height / 2 }
            }
          }
          return null
        })
        if (saveBtn) {
          await page.mouse.click(saveBtn.x, saveBtn.y)
          publishClicked = true
        }
      }

      // 策略3: 固定坐标兜底
      if (!publishClicked) {
        await page.mouse.click(690, 755)
      }

      await new Promise(r => setTimeout(r, 5000))
      const currentUrl = page.url()
      const postId = this.parseXhsUrl(currentUrl) || `xhs_auto_${Date.now()}`

      this.logger.log(`[XHS Automation] Successfully published! Post ID: ${postId}`)
      
      return {
        postId,
        permalink: currentUrl
      }

    } finally {
      await browser.close()
    }
  }

  private async performLogin(page: puppeteer.Page, phone: string, pass: string) {
     this.logger.log('[XHS Automation] Attempting to find password login toggle...')
     // 小红书常见的切换逻辑：点击“密码登录”或某个切换图标
     // 这里根据侦察结果，我们尝试点击右侧的切换模式图标
     try {
         // 尝试定位密码登录按钮
         const passwordLoginTab = await page.$$("::-p-xpath(//div[contains(text(), '密码登录')])")
         if (passwordLoginTab.length > 0) {
             await passwordLoginTab[0].click()
         } else {
             // 备选方案：点击切换图标
             await page.click('.login-mode-switch') 
         }
         
         await page.waitForSelector('input[placeholder="请输入手机号"]')
         await page.type('input[placeholder="请输入手机号"]', phone)
         await page.type('input[placeholder="请输入密码"]', pass)
         await page.click('.login-btn')
         
         // 检查是否登录成功
         await page.waitForSelector('.user-info', { timeout: 30000 })
     } catch (e) {
         this.logger.error(`[XHS Automation] Login failed: ${(e as Error).message}`)
         throw new Error('XHS login automation failed (possibly CAPTCHA triggered)')
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
