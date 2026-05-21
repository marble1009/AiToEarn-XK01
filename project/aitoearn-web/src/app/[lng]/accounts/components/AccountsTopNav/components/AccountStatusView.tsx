import type { SocialAccount } from '@/api/types/account.type'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { AccountStatus } from '@/app/config/accountConfig'
import { useTransClient } from '@/app/i18n/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function AccountStatusView({ account }: { account: SocialAccount }) {
  const { t } = useTransClient('account')

  const isSweepPlat = account.type === 'douyin' || account.type === 'xhs'
  const lastCheckTime = account.updateTime ? new Date(account.updateTime).toLocaleString() : ''

  if (account.status === AccountStatus.USABLE) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium select-none cursor-help">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CheckCircleOutlined className="text-[10px]" />
              {t('online')}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{isSweepPlat ? `Cookie 健康检测通过 (${lastCheckTime})` : `账号在线 (${lastCheckTime})`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 select-none cursor-help">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <WarningOutlined className="text-[10px]" />
            {isSweepPlat ? (
              <span>{t('sessionExpiredScan')}</span>
            ) : (
              <span>{t('offline')}</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{isSweepPlat ? `Cookie 已失效，请重新授权 (${lastCheckTime})` : `账号离线 (${lastCheckTime})`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default AccountStatusView
