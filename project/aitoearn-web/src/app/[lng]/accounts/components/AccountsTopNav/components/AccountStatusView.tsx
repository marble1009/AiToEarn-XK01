import type { SocialAccount } from '@/api/types/account.type'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { AccountStatus } from '@/app/config/accountConfig'
import { useTransClient } from '@/app/i18n/client'

function AccountStatusView({ account }: { account: SocialAccount }) {
  const { t } = useTransClient('account')

  if (account.status === AccountStatus.USABLE) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <CheckCircleOutlined className="text-[10px]" />
        {t('online')}
      </span>
    )
  }

  // 离线/失效状态：加入呼吸闪烁红字和提示
  const isSweepPlat = account.type === 'douyin' || account.type === 'xhs'

  return (
    <span className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 select-none">
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
  )
}

export default AccountStatusView
