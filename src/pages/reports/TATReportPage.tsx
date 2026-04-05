import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { materialsService } from '../../services/materials.service'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import {
  Clock, AlertTriangle, CheckCircle,
  TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'

export default function TATReportPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    materialsService.getTATReport()
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    </Layout>
  )

  const { summary, stepSummary, requestTAT } = data

  const filteredRequests = requestTAT.filter((r: any) => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    const matchSearch =
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.materialDescription.toLowerCase().includes(search.toLowerCase()) ||
      r.requestor.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Clock size={24} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TAT Report</h1>
          <p className="text-gray-500 text-sm">Turnaround Time Analysis — Step-wise & Request-wise</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Requests',
            value: summary.totalRequests,
            sub: `${summary.completedRequests} completed`,
            icon: TrendingUp,
            color: 'bg-blue-500',
          },
          {
            label: 'Avg Total TAT',
            value: `${summary.avgTotalTATDays}d`,
            sub: `${summary.avgTotalTATHours} hours`,
            icon: Clock,
            color: 'bg-purple-500',
          },
          {
            label: 'SLA Breaches',
            value: summary.totalBreaches,
            sub: `${summary.breachRate}% breach rate`,
            icon: AlertTriangle,
            color: 'bg-red-500',
          },
          {
            label: 'SLA Compliant',
            value: summary.totalSteps - summary.totalBreaches,
            sub: `${100 - summary.breachRate}% on time`,
            icon: CheckCircle,
            color: 'bg-green-500',
          },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{card.label}</p>
              <div className={`${card.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Step-wise TAT Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Step-wise TAT vs SLA Target
          <span className="text-xs font-normal text-gray-400 ml-2">(hours)</span>
        </h2>
        {stepSummary.every((s: any) => s.totalProcessed === 0) ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No completed steps yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stepSummary.filter((s: any) => s.totalProcessed > 0)}
              margin={{ top: 5, right: 20, left: 0, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => [`${value}h`, name]}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="avgHours" name="Avg TAT" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slaHours" name="SLA Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxHours" name="Max TAT" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Step-wise Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Step-wise Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Step</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">SLA (hrs)</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Avg TAT</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Min</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Max</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Processed</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Breaches</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stepSummary.map((step: any) => {
                const isBreaching = step.avgHours > step.slaHours
                return (
                  <tr key={step.step} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {step.step}. {step.label}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {step.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{step.slaHours}h</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isBreaching ? 'text-red-600' : 'text-green-600'}`}>
                        {step.avgHours}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{step.minHours}h</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{step.maxHours}h</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{step.totalProcessed}</td>
                    <td className="px-6 py-4">
                      {step.breaches > 0 ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          {step.breaches} ({step.breachRate}%)
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {step.totalProcessed === 0 ? (
                        <span className="text-xs text-gray-400">No data</span>
                      ) : isBreaching ? (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle size={12} /> Over SLA
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle size={12} /> On Time
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request-wise TAT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Request-wise TAT</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Requestor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total TAT</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Breaches</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map((req: any) => (
                <>
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {req.requestNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{req.materialDescription}</p>
                      <p className="text-xs text-gray-400">Step {req.currentStep}/8</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{req.requestor}</p>
                      <p className="text-xs text-gray-400">{req.department || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {req.totalHours}h
                      </p>
                      <p className="text-xs text-gray-400">
                        {(req.totalHours / 24).toFixed(1)} days
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {req.breachedSteps > 0 ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {req.breachedSteps} breach
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Clean ✅
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedRequest(
                          expandedRequest === req.id ? null : req.id
                        )}
                        className="text-blue-500 hover:text-blue-700 transition"
                      >
                        {expandedRequest === req.id
                          ? <ChevronUp size={18} />
                          : <ChevronDown size={18} />
                        }
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Step Details */}
                  {expandedRequest === req.id && (
                    <tr key={`${req.id}-expanded`}>
                      <td colSpan={8} className="px-6 py-4 bg-blue-50">
                        <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                          Step-wise Breakdown
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {req.stepTimings.map((timing: any, idx: number) => (
                            <div
                              key={idx}
                              className={`bg-white rounded-lg p-3 border ${timing.breach ? 'border-red-200' : 'border-gray-200'}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-gray-900">{timing.stepLabel}</p>
                                {timing.breach ? (
                                  <AlertTriangle size={12} className="text-red-500" />
                                ) : timing.exitedAt ? (
                                  <CheckCircle size={12} className="text-green-500" />
                                ) : (
                                  <Clock size={12} className="text-yellow-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{timing.role}</p>
                              {timing.durationHours ? (
                                <div className="mt-2">
                                  <p className={`text-sm font-bold ${timing.breach ? 'text-red-600' : 'text-green-600'}`}>
                                    {timing.durationHours.toFixed(1)}h
                                  </p>
                                  <p className="text-xs text-gray-400">SLA: {timing.slaHours}h</p>
                                  <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                    <div
                                      className={`h-1 rounded-full ${timing.breach ? 'bg-red-500' : 'bg-green-500'}`}
                                      style={{
                                        width: `${Math.min((timing.durationHours / timing.slaHours) * 100, 100)}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-yellow-600 mt-1">In Progress...</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}