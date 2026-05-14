'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Wallet, Banknote, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'

interface WalletAccount {
  id: string
  type: 'paypal' | 'bank' | 'crypto'
  accountName: string
  accountNumber: string
  isDefault: boolean
}

export function WalletTab() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([
    {
      id: '1',
      type: 'paypal',
      accountName: 'Personal PayPal',
      accountNumber: 'dev@aitoearn.com',
      isDefault: true,
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [newAccount, setNewAccount] = useState<Partial<WalletAccount>>({ type: 'paypal' })

  const handleAddAccount = () => {
    if (!newAccount.accountName || !newAccount.accountNumber) {
      toast.error('请填写完整信息')
      return
    }
    const account: WalletAccount = {
      id: Math.random().toString(36).substr(2, 9),
      type: newAccount.type as any,
      accountName: newAccount.accountName!,
      accountNumber: newAccount.accountNumber!,
      isDefault: accounts.length === 0,
    }
    setAccounts([...accounts, account])
    setIsAdding(false)
    setNewAccount({ type: 'paypal' })
    toast.success('收款账户绑定成功')
  }

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id))
    toast.success('账户已移除')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'paypal': return <CreditCard className="text-blue-500" />
      case 'bank': return <Banknote className="text-green-500" />
      case 'crypto': return <Wallet className="text-purple-500" />
      default: return <CreditCard />
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">收款方式管理</h3>
        <p className="text-sm text-muted-foreground">绑定您的收款账户，用于接收来自推广计划的佣金收益。</p>
      </div>

      <div className="space-y-4">
        {accounts.map((acc) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={acc.id}
            className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl">
                {getIcon(acc.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{acc.accountName}</span>
                  {acc.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded uppercase">默认</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{acc.accountNumber}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDeleteAccount(acc.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <Trash2 size={18} />
            </Button>
          </motion.div>
        ))}

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold">添加收款账户</span>
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              {(['paypal', 'bank', 'crypto'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewAccount({ ...newAccount, type: t })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${newAccount.type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  {t === 'paypal' ? 'PayPal' : t === 'bank' ? '银行卡' : 'Crypto'}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <Input 
                placeholder="账户名称 (如: 我的 PayPal)" 
                value={newAccount.accountName || ''}
                onChange={e => setNewAccount({ ...newAccount, accountName: e.target.value })}
                className="rounded-xl"
              />
              <Input 
                placeholder={newAccount.type === 'crypto' ? '钱包地址 (USDT-TRC20)' : '账号 (Email 或 卡号)'} 
                value={newAccount.accountNumber || ''}
                onChange={e => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAccount} className="flex-1 rounded-xl">保存并绑定</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">取消</Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-5 bg-muted/50 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">安全提示</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          为了确保您的资金安全，收款账户在首次绑定 24 小时后方可用于提现。请确保账户名与您的实名认证信息一致。所有提现操作都需要进行多重身份验证。
        </p>
      </div>
    </div>
  )
}
