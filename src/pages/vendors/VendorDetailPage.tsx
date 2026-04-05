import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { vendorsService, VendorRequest } from '../../services/vendors.service'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2, Copy } from 'lucide-react'

const DEPARTMENTS = ['FINANCE', 'COMMERCIALS', 'QUALITY', 'MDM', 'MANAGER']

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  VENDOR_SUBMITTED: { label: 'Vendor Submitted', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'All Dept Approved', className: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendor, setVendor] = useState<VendorRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionComment, setActionComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchVendor = () => {
    if (!id) return
    vendorsService.findOne(id)
      .then(res => setVendor(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVendor() }, [id])

  const handleReview = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      await vendorsService.reviewVendorData(id)
      fetchVendor()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!id) return
    setSubmitting(true)
    try {
      await vendorsService.takeAction(id, { action, comment: actionComment })
      setActionComment('')
      fetchVendor()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCfoApproval = async (action: string) => {
    if (!id) return
    setSubmitting(true)
    try {
      await vendorsService.cfoApproval(id, { action, comment: actionComment })
      setActionComment('')
      fetchVendor()
    } finally {
      setSubmitting(false)
    }
  }

 // नवीन — replace करा
const canDeptAct = vendor?.status === 'IN_REVIEW' &&
  DEPARTMENTS.includes(user?.role || '') &&
  !vendor?.approvalStatus?.find(a => a.department === user?.role && a.status === 'approved')

  const canCfoAct = vendor?.status === 'APPROVED' && user?.role === 'CFO'
  const canReview = vendor?.status === 'VENDOR_SUBMITTED' && user?.role === 'REQUESTOR'

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    </Layout>
  )

  if (!vendor) return (
    <Layout>
      <div className="text-center py-12 text-gray-400">Vendor request not found</div>
    </Layout>
  )

  const statusInfo = statusConfig[vendor.status] || statusConfig.PENDING

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{vendor.requestNumber}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{vendor.vendorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Vendor Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              Vendor Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Vendor Name', value: vendor.vendorName },
                { label: 'PAN Number', value: vendor.panNumber },
                { label: 'GST Number', value: vendor.gstNumber || '—' },
                { label: 'Email', value: vendor.email },
                { label: 'Mobile', value: vendor.mobile || '—' },
                { label: 'Created', value: new Date(vendor.createdAt).toLocaleDateString('en-IN') },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Link */}
          {vendor.status === 'PENDING' && vendor.portalToken && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h2 className="font-semibold text-blue-900 mb-2">Vendor Portal Link</h2>
              <p className="text-sm text-blue-700 break-all mb-3">
                {`http://localhost:5173/vendor-portal/${vendor.portalToken}`}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(`http://localhost:5173/vendor-portal/${vendor.portalToken}`)}
                className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                <Copy size={14} />
                Copy Link
              </button>
            </div>
          )}

          {/* Vendor Submitted Data */}
          {vendor.status !== 'PENDING' && Object.keys(vendor.fieldValues || {}).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Submitted Data</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(vendor.fieldValues || {}).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{String(value)}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Review Action */}
          {canReview && (
            <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock size={18} className="text-yellow-500" />
                Vendor has submitted their details
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Review the submitted data and send for parallel department approvals.
              </p>
              <button
                onClick={handleReview}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Send for Department Approvals →'}
              </button>
            </div>
          )}

          {/* Department Action */}
          {canDeptAct && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                Your Action Required — {user?.role} Department
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

          {/* CFO Action */}
          {canCfoAct && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-purple-500" />
                CFO Final Approval Required
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                All departments have approved. Your final sign-off will complete the vendor onboarding.
              </p>
              <textarea
                value={actionComment}
                onChange={e => setActionComment(e.target.value)}
                placeholder="Add comment (optional)..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleCfoApproval('approved')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Final Approve
                </button>
                <button
                  onClick={() => handleCfoApproval('rejected')}
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Approval Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Department Approvals</h2>
            <div className="space-y-3">
              {vendor.approvalStatus?.map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${dept.status === 'approved' ? 'bg-green-100' :
                      dept.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    {dept.status === 'approved' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : dept.status === 'rejected' ? (
                      <XCircle size={16} className="text-red-600" />
                    ) : (
                      <Clock size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{dept.department}</p>
                    {dept.comment && (
                      <p className="text-xs text-gray-500 mt-0.5">{dept.comment}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${dept.status === 'approved' ? 'bg-green-100 text-green-700' :
                      dept.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'}`}>
                    {dept.status === 'PENDING' ? 'Pending' : dept.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CFO Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">CFO Final Approval</h2>
            {vendor.status === 'COMPLETED' ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">Approved ✅</span>
              </div>
            ) : vendor.status === 'APPROVED' ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <Clock size={20} />
                <span className="text-sm font-medium">Pending CFO Review</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={20} />
                <span className="text-sm">Waiting for dept approvals</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}