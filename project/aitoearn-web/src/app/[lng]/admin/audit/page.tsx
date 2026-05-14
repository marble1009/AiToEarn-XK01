'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, ExternalLink, ShieldCheck, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPendingSubmissionsApi, auditSubmissionApi, WorkSubmission } from '@/api/mission'
import { toast } from 'react-hot-toast'

export default function AdminAuditPage() {
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const data = await getPendingSubmissionsApi()
      setSubmissions(data || [])
    } catch (err) {
      toast.error('Failed to fetch submissions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleAudit = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      await auditSubmissionApi({ submissionId, status })
      toast.success(`Submission ${status === 'approved' ? 'approved & paid' : 'rejected'}`)
      setSubmissions(prev => prev.filter(s => s.id !== submissionId))
    } catch (err) {
      toast.error('Audit failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
              <ShieldCheck size={18} />
              Admin Control Center
            </div>
            <h1 className="text-4xl font-black text-gray-900">Work Audit Dashboard</h1>
            <p className="text-gray-500">Review and verify creator submissions to release rewards.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={fetchSubmissions} 
              className="h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-4 px-6"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Pending</p>
                <p className="text-xl font-black text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {isLoading ? (
             <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
             </div>
          ) : submissions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-20 text-center space-y-4 border border-dashed border-gray-200"
            >
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                <Check size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
                <p className="text-gray-500">No pending submissions require your attention right now.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map((submission, index) => (
                <AuditCard 
                  key={submission.id} 
                  submission={submission} 
                  index={index}
                  onApprove={() => handleAudit(submission.id, 'approved')}
                  onReject={() => handleAudit(submission.id, 'rejected')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AuditCard({ submission, index, onApprove, onReject }: { 
  submission: WorkSubmission, 
  index: number,
  onApprove: () => void,
  onReject: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row items-center gap-8"
    >
      {/* Mission Info */}
      <div className="flex-grow space-y-4 w-full">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-50 text-blue-600 border-none">{submission.brand}</Badge>
          <span className="text-xs text-gray-400 font-medium">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{submission.missionTitle}</h3>
          <div className="flex items-center gap-2 mt-2 text-orange-600 font-bold">
            <span className="text-sm uppercase tracking-tighter">Reward:</span>
            <span>${(submission.rewardValue / 100).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group">
          <div className="flex items-center gap-3 truncate mr-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
              <ExternalLink size={16} />
            </div>
            <a 
              href={submission.workUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors truncate font-medium"
            >
              {submission.workUrl}
            </a>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 text-blue-600 font-bold" asChild>
            <a href={submission.workUrl} target="_blank" rel="noopener noreferrer">Verify Link</a>
          </Button>
        </div>
      </div>

      {/* Audit Actions */}
      <div className="flex gap-4 shrink-0 w-full md:w-auto">
        <Button 
          variant="outline" 
          onClick={onReject}
          className="flex-grow md:w-32 h-16 rounded-2xl border-gray-200 text-red-500 font-bold hover:bg-red-50 hover:border-red-100 transition-all gap-2"
        >
          <X size={20} />
          Reject
        </Button>
        <Button 
          onClick={onApprove}
          className="flex-grow md:w-48 h-16 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-all gap-2 shadow-lg shadow-gray-200"
        >
          <Check size={20} />
          Approve & Pay
        </Button>
      </div>
    </motion.div>
  )
}
