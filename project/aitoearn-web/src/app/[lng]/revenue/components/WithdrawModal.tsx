'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { CreditCard, Wallet, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react'

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  balance: number
}

export default function WithdrawModal({ open, onClose, balance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'paypal' | 'bank' | 'crypto'>('paypal')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('请输入有效的提现金额')
      return
    }
    if (numAmount > balance / 100) {
      toast.error('提现金额不能超过可用余额')
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSuccess(true)
    toast.success('提现申请已提交')
  }

  const resetAndClose = () => {
    setSuccess(false)
    setAmount('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-cream/95 backdrop-blur-xl rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">提现申请</DialogTitle>
        
        {!success ? (
          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">提现至个人账户</h2>
              <p className="text-gray-500 text-sm">可用余额: <span className="font-bold text-green-600">${(balance / 100).toFixed(2)} USD</span></p>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">提现金额 (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                <Input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-16 pl-10 pr-4 text-2xl font-black rounded-2xl border-2 border-gray-100 focus:border-green-500 focus:ring-0 bg-white transition-all"
                />
              </div>
            </div>

            {/* Methods Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">选择收款方式</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setMethod('paypal')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${method === 'paypal' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                  <CreditCard size={24} />
                  <span className="text-[10px] font-black uppercase">PayPal</span>
                </button>
                <button 
                  onClick={() => setMethod('bank')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${method === 'bank' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                  <Banknote size={24} />
                  <span className="text-[10px] font-black uppercase">银行卡</span>
                </button>
                <button 
                  onClick={() => setMethod('crypto')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${method === 'crypto' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                  <Wallet size={24} />
                  <span className="text-[10px] font-black uppercase">USDT</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                提现处理通常需要 1-3 个工作日。单笔最低提现额为 $10.00。请确保您的收款账户已完成实名认证。
              </p>
            </div>

            <Button 
              onClick={handleWithdraw}
              disabled={loading || !amount}
              className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '正在处理请求...' : '确认提现'}
            </Button>
          </div>
        ) : (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">申请已提交</h2>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                您的提现请求已成功发送至财务系统。我们将在审核通过后第一时间为您转账。
              </p>
            </div>
            <Button 
              onClick={resetAndClose}
              className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold"
            >
              我知道了
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
