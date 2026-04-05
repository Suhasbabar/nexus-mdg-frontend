import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { materialsService } from '../../services/materials.service'
import { vendorsService } from '../../services/vendors.service'
import { useAuth } from '../../context/AuthContext'
import { Inbox, Clock, FileText, Building2 } from 'lucide-react'

export default function InboxPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [materialRequests, setMaterialRequests] = useState<any[]>([])
  const [vendorRequests, setVendorRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'materials' | 'vendors'>('materials')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [matRes, venRes] = await Promise.all([
          materialsService.getInbox(),
          vendorsService.findAll(),
        ])
        setMaterialRequests(matRes.data)

        // Filter vendor requests relevant to this user's role
        const role = user?.role || ''
        const DEPT_ROLES = ['FINANCE', 'COMMERCIALS', 'QUALITY', 'MDM', 'MANAGER']

        let filteredVendors = venRes.data
        if (role === 'CFO') {
          // CFO sees vendors with APPROVED status
          filteredVendors = venRes.data.filter((v: any) => v.status === 'APPROVED')
        } else if (role === 'REQUESTOR') {
          // Requestor sees VENDOR_SUBMITTED (waiting for their review)
          filteredVendors = venRes.data.filter((v: any) => v.status === 'VENDOR_SUBMITTED')
        } else if (DEPT_ROLES.includes(role)) {
          // Dept sees IN_REVIEW vendors they haven't acted on yet
          filteredVendors = venRes.data.filter((v: any) => v.status === 'IN_REVIEW')
        } else {
          filteredVendors = []
        }

        setVendorRequests(filteredVendors)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user])

  const totalPending = materialRequests.length + vendorRequests.length

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Inbox size={24} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Inbox</h1>
          <p className="text-gray-500 text-sm">Requests pending your action</p>
        </div>
        <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {totalPending} pending
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
            ${activeTab === 'materials'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <FileText size={16} />
          Material Master
          {materialRequests.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs
              ${activeTab === 'materials' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
              {materialRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
            ${activeTab === 'vendors'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Building2 size={16} />
          Vendor Onboarding
          {vendorRequests.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs
              ${activeTab === 'vendors' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
              {vendorRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Material Requests Tab */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : materialRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending material requests</p>
              <p className="text-sm mt-1">Your material inbox is clear ✅</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Requestor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materialRequests.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/materials/${req.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{req.requestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{req.materialDescription}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{req.requestor.name}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vendor Requests Tab */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : vendorRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending vendor requests</p>
              <p className="text-sm mt-1">Your vendor inbox is clear ✅</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vendor Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">PAN</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendorRequests.map(vendor => (
                  <tr
                    key={vendor.id}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{vendor.requestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.vendorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.panNumber}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {vendor.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Layout>
  )
}