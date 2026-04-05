import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { vendorsService, VendorRequest } from '../../services/vendors.service'
import { Plus, Search, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  VENDOR_SUBMITTED: { label: 'Vendor Submitted', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'All Dept Approved', className: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

export default function AllVendorsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendors, setVendors] = useState<VendorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    vendorsService.findAll()
      .then(res => setVendors(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = vendors.filter(v =>
    v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    v.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.panNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Onboarding</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage vendor onboarding requests</p>
        </div>
        {user?.role === 'REQUESTOR' && (
          <button
            onClick={() => navigate('/vendors/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Plus size={16} />
            New Vendor
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by vendor name, request# or PAN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading vendors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No vendor requests found</p>
            {user?.role === 'REQUESTOR' && (
              <button
                onClick={() => navigate('/vendors/new')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Create First Vendor
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vendor Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">PAN</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(vendor => {
                const config = statusConfig[vendor.status] || statusConfig.PENDING
                return (
                  <tr
                    key={vendor.id}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{vendor.requestNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{vendor.vendorName}</p>
                      {vendor.gstNumber && (
                        <p className="text-xs text-gray-400">GST: {vendor.gstNumber}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.panNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}