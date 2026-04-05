import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { materialsService, MaterialRequest } from '../../services/materials.service'
import { Plus, Search, FileText } from 'lucide-react'

export default function MyRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    materialsService.findAll()
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter(r =>
    r.materialDescription.toLowerCase().includes(search.toLowerCase()) ||
    r.requestNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your material master requests</p>
        </div>
        <button
          onClick={() => navigate('/materials/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by description or request number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No requests found</p>
            <p className="text-sm mt-1">Create your first material request</p>
            <button
              onClick={() => navigate('/materials/new')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              New Request
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Step</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(req => (
                <tr
                  key={req.id}
                  onClick={() => navigate(`/materials/${req.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{req.requestNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.materialDescription}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.materialType.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4"><PriorityBadge priority={req.priority} /></td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">Step {req.currentStep}/8</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}