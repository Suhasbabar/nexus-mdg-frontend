import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { materialsService, MaterialRequest } from '../../services/materials.service'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Send, Clock } from 'lucide-react'

const WORKFLOW_STEPS = [
  { step: 1, role: 'TBRC', label: 'TBRC Review' },
  { step: 2, role: 'PRODUCTION', label: 'Production' },
  { step: 3, role: 'WAREHOUSING', label: 'Warehousing' },
  { step: 4, role: 'FINANCE', label: 'Finance' },
  { step: 5, role: 'SALES', label: 'Sales' },
  { step: 6, role: 'COMMERCIALS', label: 'Commercials' },
  { step: 7, role: 'QUALITY', label: 'Quality' },
  { step: 8, role: 'MDM', label: 'MDM Final' },
]

export default function RequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [request, setRequest] = useState<MaterialRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [actionComment, setActionComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRequest = () => {
    if (!id) return
    materialsService.findOne(id)
      .then(res => setRequest(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequest() }, [id])

  const currentStepInfo = WORKFLOW_STEPS.find(s => s.step === request?.currentStep)
  const canAct = currentStepInfo?.role === user?.role

  const handleAction = async (action: string) => {
    if (!id) return
    setSubmitting(true)
    try {
      await materialsService.takeAction(id, { action, comment: actionComment })
      setActionComment('')
      fetchRequest()
    } finally {
      setSubmitting(false)
    }
  }

  const handleComment = async () => {
    if (!id || !comment.trim()) return
    setSubmitting(true)
    try {
      await materialsService.addComment(id, comment)
      setComment('')
      fetchRequest()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    </Layout>
  )

  if (!request) return (
    <Layout>
      <div className="text-center py-12 text-gray-400">Request not found</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{request.requestNumber}</h1>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{request.materialDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Request Number', value: request.requestNumber },
                { label: 'Material Type', value: request.materialType.replace(/_/g, ' ') },
                { label: 'Plant', value: request.plant || '—' },
                { label: 'Current Step', value: `Step ${request.currentStep} of 8` },
                { label: 'Requestor', value: request.requestor.name },
                { label: 'Created', value: new Date(request.createdAt).toLocaleDateString('en-IN') },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Workflow Progress</h2>
            <div className="space-y-3">
              {WORKFLOW_STEPS.map(step => {
                const isCompleted = request.currentStep > step.step || request.status === 'COMPLETED'
                const isCurrent = request.currentStep === step.step && request.status !== 'COMPLETED' && request.status !== 'REJECTED'
                // const isPending = request.currentStep < step.step

                return (
                  <div key={step.step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                      ${isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white' :
                        'bg-gray-100 text-gray-400'}`}>
                      {isCompleted ? '✓' : step.step}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{step.role}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                        Done
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Panel */}
          {canAct && request.status !== 'COMPLETED' && request.status !== 'REJECTED' && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                Your Action Required — {currentStepInfo?.label}
              </h2>
              <textarea
                value={actionComment}
                onChange={e => setActionComment(e.target.value)}
                placeholder="Add comment (optional)..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Comments ({request.comments?.length || 0})
            </h2>

            {/* Add Comment */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={submitting || !comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Comment List */}
            <div className="space-y-3">
              {request.comments?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
              ) : (
                request.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs font-medium">
                        {c.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{c.author.name}</span>
                        <span className="text-xs text-gray-400">{c.author.role}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Approvals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Approval History</h2>
            <div className="space-y-3">
              {request.approvals?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No approvals yet</p>
              ) : (
                request.approvals?.map((a: any) => (
                  <div key={a.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{a.approver.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${a.action === 'approved' ? 'bg-green-100 text-green-700' :
                          a.action === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {a.action}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{a.role} • Step {a.stepId}</p>
                    {a.comment && (
                      <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">
                        {a.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}