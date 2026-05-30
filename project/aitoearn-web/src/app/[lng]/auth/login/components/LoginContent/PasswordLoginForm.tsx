/**
 * PasswordLoginForm - 密码登录与注册表单
 * 支持账户密码登录，以及账号密码注册，减少验证码使用频率
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { passwordLoginApi, passwordRegisterApi } from '@/api/auth'
import { useTransClient } from '@/app/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { useUserStore } from '@/store/user'

interface PasswordLoginFormProps {
  /** 弹框模式：登录成功回调，替代 router.push */
  onLoginSuccess?: () => void
  /** 覆盖 searchParams 的 redirect */
  redirectUrl?: string
  /** 覆盖 searchParams 的 inviteCode */
  inviteCode?: string
}

type AuthMode = 'login' | 'register'

export function PasswordLoginForm({ onLoginSuccess, redirectUrl, inviteCode: inviteCodeProp }: PasswordLoginFormProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = redirectUrl ?? searchParams.get('redirect')
  const { setToken, setUserInfo } = useUserStore()
  const { t } = useTransClient('login')
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  // Validation Schemas
  const loginSchema = useMemo(
    () =>
      z.object({
        identifier: z.string().min(1, t('emailRequired')),
        password: z.string().min(6, t('passwordTooShort')),
      }),
    [t],
  )

  const registerSchema = useMemo(
    () =>
      z.object({
        username: z.string().optional(),
        email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
        password: z.string().min(6, t('passwordTooShort')),
        inviteCode: z.string().optional(),
      }),
    [t],
  )

  type LoginFormData = z.infer<typeof loginSchema>
  type RegisterFormData = z.infer<typeof registerSchema>

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', inviteCode: '' },
  })

  /** Submit Password Login */
  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const res = await passwordLoginApi({
        identifier: data.identifier,
        password: data.password,
      })
      if (!res) return

      if (res.code === 0 && res.data.token) {
        setToken(res.data.token)
        if (res.data.userInfo) {
          setUserInfo(res.data.userInfo)
        }
        toast.success(t('loginSuccess'))
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          router.push(redirect || '/')
        }
      } else {
        toast.error(res.message || t('loginFailed'))
      }
    } catch (err: any) {
      toast.error(err?.message || t('loginError'))
    }
  }

  /** Submit Password Registration */
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const inviteCode = inviteCodeProp ?? searchParams.get('inviteCode') ?? data.inviteCode ?? undefined
      const res = await passwordRegisterApi({
        username: data.username || undefined,
        mail: data.email,
        password: data.password,
        inviteCode,
      })
      if (!res) return

      if (res.code === 0 && res.data.token) {
        setToken(res.data.token)
        if (res.data.userInfo) {
          setUserInfo(res.data.userInfo)
        }
        toast.success(t('registerSuccess'))
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          router.push(redirect || '/')
        }
      } else {
        toast.error(res.message || t('registerFailed'))
      }
    } catch (err: any) {
      toast.error(err?.message || t('loginError'))
    }
  }

  if (authMode === 'login') {
    return (
      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder={t('loginIdentifierPlaceholder')}
            {...loginForm.register('identifier')}
            className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
          />
          {loginForm.formState.errors.identifier && (
            <p className="mt-1 text-xs text-destructive">
              {loginForm.formState.errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder={t('passwordPlaceholder')}
            {...loginForm.register('password')}
            className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
          />
          {loginForm.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {loginForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loginForm.formState.isSubmitting}
          className="h-12 w-full cursor-pointer rounded-xl text-base font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all border-none"
        >
          {loginForm.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            t('login')
          )}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
          >
            {t('dontHaveAccount')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          {...registerForm.register('email')}
          className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
        />
        {registerForm.formState.errors.email && (
          <p className="mt-1 text-xs text-destructive">
            {registerForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="text"
          placeholder={t('usernamePlaceholder')}
          {...registerForm.register('username')}
          className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
        />
        {registerForm.formState.errors.username && (
          <p className="mt-1 text-xs text-destructive">
            {registerForm.formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          {...registerForm.register('password')}
          className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
        />
        {registerForm.formState.errors.password && (
          <p className="mt-1 text-xs text-destructive">
            {registerForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="text"
          placeholder={t('inviteCodePlaceholder')}
          {...registerForm.register('inviteCode')}
          className="h-12 rounded-xl border border-border bg-black/60 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary transition-all outline-none"
        />
      </div>

      <Button
        type="submit"
        disabled={registerForm.formState.isSubmitting}
        className="h-12 w-full cursor-pointer rounded-xl text-base font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all border-none"
      >
        {registerForm.formState.isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          t('register')
        )}
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
        >
          {t('alreadyHaveAccount')}
        </button>
      </div>
    </form>
  )
}
