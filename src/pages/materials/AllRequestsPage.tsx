import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { materialsService, MaterialRequest } from '../../services/materials.service'
import { Search, Filter, Download, ClipboardList } from 'lucide-react'

const STATUS_FILTERS = ['ALL', 'SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED']
const PRIORITY_FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function AllRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  useEffect(() => {
    materialsService.findAll()
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter(r => {
    const matchSearch =
      r.materialDescription.toLowerCase().includes(search.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.requestor.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    const matchPriority = priorityFilter === 'ALL' || r.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const exportCSV = () => {
    const headers = ['Request#', 'Description', 'Type', 'Priority', 'Status', 'Step', 'Requestor', 'Date']
    const rows = filtered.map(r => [
      r.requestNumber,
      r.materialDescription,
      r.materialType,
      r.priority,
      r.status,
      `${r.currentStep}/8`,
      r.requestor.name,
      new Date(r.createdAt).toLocaleDateString('en-IN'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `material-requests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Summary counts
  const counts = {
    total: requests.length,
    submitted: requests.filter(r => r.status === 'SUBMITTED').length,
    inReview: requests.filter(r => r.status === 'IN_REVIEW').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Complete view of all material master requests
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Submitted', value: counts.submitted, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'In Review', value: counts.inReview, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Completed', value: counts.completed, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Rejected', value: counts.rejected, color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(card => (
          <div key={card.label} className={`border rounded-xl px-4 py-3 ${card.color}`}>
            <p className="text-xs font-medium opacity-70">{card.label}</p>
            <p className="text-2xl font-bold mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-4">

          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description, request# or requestor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_FILTERS.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITY_FILTERS.map(p => (
                <option key={p} value={p}>{p === 'ALL' ? 'All Priority' : p}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL') }}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing <span className="font-medium text-gray-900">{filtered.length}</span> of{' '}
        <span className="font-medium text-gray-900">{requests.length}</span> requests
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No requests found</p>
            <p className="text-sm mt-1">Try changing the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requestor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Step</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/materials/${req.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {req.requestNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">{req.materialDescription}</p>
                      {req.plant && (
                        <p className="text-xs text-gray-400">Plant: {req.plant}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {req.materialType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{req.requestor.name}</p>
                      <p className="text-xs text-gray-400">{req.requestor.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${(req.currentStep / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{req.currentStep}/8</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}