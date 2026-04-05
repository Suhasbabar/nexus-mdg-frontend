import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { materialsService } from '../../services/materials.service'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, CheckCircle, Clock,
  AlertTriangle, Building2, FileText
} from 'lucide-react'

export default function KPIDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    materialsService.getKPIReport()
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

  const { summary, stepTATData, monthlyData, priorityData } = data

  const summaryCards = [
    {
      label: 'Total Material Requests',
      value: summary.totalMaterials,
      icon: FileText,
      color: 'bg-blue-500',
      sub: `${summary.completionRate}% completion rate`
    },
    {
      label: 'Completed',
      value: summary.completedMaterials,
      icon: CheckCircle,
      color: 'bg-green-500',
      sub: `${summary.rejectedMaterials} rejected`
    },
    {
      label: 'Pending',
      value: summary.pendingMaterials,
      icon: Clock,
      color: 'bg-yellow-500',
      sub: 'In progress'
    },
    {
      label: 'SLA Breaches',
      value: summary.slaBreaches,
      icon: AlertTriangle,
      color: 'bg-red-500',
      sub: `${summary.slaCompliant} compliant`
    },
    {
      label: 'Total Vendors',
      value: summary.totalVendors,
      icon: Building2,
      color: 'bg-purple-500',
      sub: `${summary.completedVendors} onboarded`
    },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={24} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time performance metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          {monthlyData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Submitted"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          {priorityData.every((p: any) => p.value === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityData.filter((p: any) => p.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {priorityData.map((p: any) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-sm text-gray-600">{p.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 — Step TAT */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Step-wise TAT Analysis
          <span className="text-xs font-normal text-gray-400 ml-2">(hours)</span>
        </h2>
        {stepTATData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No completed steps yet — approve some requests to see TAT data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stepTATData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="step"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: string) => [`${value}h`, name]}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="avgHours" name="Avg TAT (hrs)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slaHours" name="SLA Target (hrs)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* SLA Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">SLA Compliance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Compliant</span>
                <span className="font-medium text-green-600">{summary.slaCompliant}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: summary.slaCompliant + summary.slaBreaches > 0
                      ? `${(summary.slaCompliant / (summary.slaCompliant + summary.slaBreaches)) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Breached</span>
                <span className="font-medium text-red-600">{summary.slaBreaches}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: summary.slaCompliant + summary.slaBreaches > 0
                      ? `${(summary.slaBreaches / (summary.slaCompliant + summary.slaBreaches)) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Vendor Onboarding Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-700">{summary.totalVendors}</p>
              <p className="text-xs text-purple-500 mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">{summary.completedVendors}</p>
              <p className="text-xs text-green-500 mt-1">Completed</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-700">{summary.rejectedVendors}</p>
              <p className="text-xs text-red-500 mt-1">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}