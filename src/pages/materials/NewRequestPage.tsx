import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { materialsService } from '../../services/materials.service'
import { ArrowLeft, Send } from 'lucide-react'

const MATERIAL_TYPES = [
  'RAW_MATERIAL',
  'FINISHED_GOODS',
  'SEMI_FINISHED',
  'PACKAGING',
  'SPARE_PARTS',
  'CONSUMABLES',
  'SERVICES',
  'NON_STOCK',
]

export default function NewRequestPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    materialDescription: '',
    materialType: 'RAW_MATERIAL',
    plant: '',
    priority: 'MEDIUM',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await materialsService.create(form)
      navigate(`/materials/${res.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Material Request</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create a new SAP Material Master request</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Material Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.materialDescription}
                onChange={e => setForm({ ...form, materialDescription: e.target.value })}
                placeholder="e.g. Steel Rod 10mm IS2062"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Material Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.materialType}
                onChange={e => setForm({ ...form, materialType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MATERIAL_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Plant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant
              </label>
              <input
                type="text"
                value={form.plant}
                onChange={e => setForm({ ...form, plant: e.target.value })}
                placeholder="e.g. 1000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-2 rounded-lg text-sm font-medium border transition
                      ${form.priority === p
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}