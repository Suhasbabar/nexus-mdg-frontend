import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { materialsService } from '../services/materials.service'
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Plus, Inbox } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [inboxRequests, setInboxRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      materialsService.getStats(),
      materialsService.findAll(),
      materialsService.getInbox(),
    ]).then(([statsRes, allRes, inboxRes]) => {
      setStats(statsRes.data)
      setRecentRequests(allRes.data.slice(0, 5))
      setInboxRequests(inboxRes.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Requests',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600'
    },
    {
      label: 'Completed',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      bg: 'bg-red-50',
      text: 'text-red-600'
    },
  ]

  return (
    <Layout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="mt-1 text-blue-100">
              {user?.role} • {user?.department || 'Nexus MDG Platform'}
            </p>
            <p className="mt-3 text-sm text-blue-200">
              SAP Master Data Governance — Material Master & Vendor Onboarding
            </p>
          </div>
          {user?.role === 'REQUESTOR' && (
            <button
              onClick={() => navigate('/materials/new')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition"
            >
              <Plus size={16} />
              New Request
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <stat.icon size={22} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Recent Requests
            </h2>
            <button
              onClick={() => navigate('/materials/my')}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No requests yet</p>
                {user?.role === 'REQUESTOR' && (
                  <button
                    onClick={() => navigate('/materials/new')}
                    className="mt-3 text-xs text-blue-600 hover:underline"
                  >
                    Create first request →
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/materials/${req.id}`)}
                    className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">{req.requestNumber}</p>
                      <p className="text-xs text-gray-500 truncate">{req.materialDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Inbox */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Inbox size={18} className="text-yellow-500" />
              Pending Actions
              {inboxRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {inboxRequests.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => navigate('/inbox')}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : inboxRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Inbox is empty</p>
                <p className="text-xs mt-1">No pending actions ✅</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {inboxRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/materials/${req.id}`)}
                    className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">{req.requestNumber}</p>
                      <p className="text-xs text-gray-500 truncate">{req.materialDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={req.priority} />
                      <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">
                        Step {req.currentStep}/8
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}