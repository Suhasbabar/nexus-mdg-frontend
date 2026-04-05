import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { vendorsService } from '../../services/vendors.service'
import { CheckCheck, Building2 } from 'lucide-react'

export default function VendorPortalPage() {
  const { token } = useParams()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    fieldValues: {},
  })

  useEffect(() => {
    if (!token) return
    vendorsService.getByToken(token)
      .then(res => {
        setVendor(res.data)
        if (res.data.status !== 'PENDING') setSubmitted(true)
      })
      .catch(() => setError('Invalid or expired portal link'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    try {
      await vendorsService.vendorPortalSubmit(token, form)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCheck size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Details Submitted!</h2>
        <p className="text-gray-500">
          Thank you! Your details have been submitted successfully.
          Our team will review and get back to you shortly.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Onboarding Portal</h1>
          <p className="text-gray-500 mt-1">Welcome, <strong>{vendor?.vendorName}</strong></p>
          <p className="text-sm text-gray-400 mt-1">Please fill in your details below</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Address Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={e => setForm({ ...form, addressLine1: e.target.value })}
                    placeholder="Building, Street"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={form.addressLine2}
                    onChange={e => setForm({ ...form, addressLine2: e.target.value })}
                    placeholder="Area, Landmark"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={e => setForm({ ...form, pincode: e.target.value })}
                      placeholder="400001"
                      maxLength={6}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Bank Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                    placeholder="State Bank of India"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.accountNumber}
                      onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                      placeholder="1234567890"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.ifscCode}
                      onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Details →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}