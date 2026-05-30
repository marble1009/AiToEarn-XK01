/**
 * LoginDialog - 全局登录弹框组件
 * 在当前页面弹出登录表单，避免跳转到独立登录页
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { EmailLoginForm } from '@/app/[lng]/auth/login/components/LoginContent/EmailLoginForm'
import { PasswordLoginForm } from '@/app/[lng]/auth/login/components/LoginContent/PasswordLoginForm'
import { useTransClient } from '@/app/i18n/client'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'
import { useLoginDialogStore } from './store'

export default function LoginDialog() {
  const { visible } = useLoginDialogStore(
    useShallow(state => ({ visible: state.visible })),
  )

  if (!visible)
    return null

  return <LoginDialogContent />
}

const LoginDialogContent = memo(() => {
  const router = useRouter()
  const { t } = useTransClient('login')
  const isMobile = useIsMobile()
  const [loginMethod, setLoginMethod] = useState<'code' | 'password'>('password')
  const { redirectUrl, inviteCode, fromGuard, closeLoginDialog } = useLoginDialogStore(
    useShallow(state => ({
      redirectUrl: state.redirectUrl,
      inviteCode: state.inviteCode,
      fromGuard: state.fromGuard,
      closeLoginDialog: state.closeLoginDialog,
    })),
  )

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      closeLoginDialog()
      if (fromGuard) {
        router.push('/')
      }
    }
  }, [closeLoginDialog, fromGuard, router])

  const handleLoginSuccess = useCallback(() => {
    closeLoginDialog()
    if (fromGuard) {
      window.location.reload()
    }
    else if (redirectUrl) {
      router.push(redirectUrl)
    }
  }, [closeLoginDialog, fromGuard, redirectUrl, router])

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'bg-[#09090b]/95 border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.25)] text-foreground backdrop-blur-md',
          isMobile
            ? 'fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none w-full max-w-none data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 border-x-0 border-b-0 border-t-[#39FF14]/30'
            : 'sm:w-[min(460px,95vw)] rounded-2xl',
        )}
      >
        <DialogTitle className="sr-only">{t('welcomeBack')}</DialogTitle>

        {/* Logo + 标题 */}
        <div className="flex flex-col items-center pb-2 pt-2">
          <div className="relative mb-4 flex size-14 items-center justify-center rounded-xl bg-black border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.4)]">
            <span className="text-[#39FF14] text-xl font-black tracking-wider">A</span>
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#FF007F] animate-ping" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#FF007F]" />
          </div>
          <h2 className="text-xl font-black tracking-widest text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
            Aura<span className="text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]">String</span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground tracking-wide">{t('loginSubtitle') || '极简内容实验室 - 终端接入'}</p>
        </div>

        {/* 登录方式切换 Tab */}
        <div className="mb-4 flex rounded-lg bg-black/40 p-1 border border-border">
          <button
            type="button"
            onClick={() => setLoginMethod('password')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer ${
              loginMethod === 'password'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('passwordLogin')}
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('code')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer ${
              loginMethod === 'code'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('emailCodeLogin')}
          </button>
        </div>

        {/* 登录表单 */}
        <div className="px-2">
          {loginMethod === 'password' ? (
            <PasswordLoginForm
              onLoginSuccess={handleLoginSuccess}
              redirectUrl={redirectUrl}
              inviteCode={inviteCode}
            />
          ) : (
            <EmailLoginForm
              onLoginSuccess={handleLoginSuccess}
              redirectUrl={redirectUrl}
              inviteCode={inviteCode}
            />
          )}
        </div>

        {/* 底部条款 */}
        <p className="pb-2 text-center text-xs text-muted-foreground/70">
          {t('termsText')}
          {' '}
          <Link
            href="/websit/terms-of-service"
            className="text-muted-foreground underline hover:text-foreground hover:text-[#39FF14] transition-colors"
          >
            {t('termsOfService')}
          </Link>
          {' '}
          {t('and')}
          {' '}
          <Link
            href="/websit/privacy-policy"
            className="text-muted-foreground underline hover:text-foreground hover:text-[#39FF14] transition-colors"
          >
            {t('privacyPolicy')}
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
})

LoginDialogContent.displayName = 'LoginDialogContent'

