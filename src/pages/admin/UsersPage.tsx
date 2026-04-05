import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { usersService } from '../../services/users.service'
import {
  Users, Search, CheckCircle, XCircle,
  Edit2, UserX, UserCheck, Plus, X, Eye, EyeOff
} from 'lucide-react'

const ROLES = [
  'REQUESTOR', 'TBRC', 'PRODUCTION', 'WAREHOUSING',
  'FINANCE', 'SALES', 'COMMERCIALS', 'QUALITY',
  'MDM', 'ADMIN', 'CFO', 'MANAGER'
]

const roleColors: Record<string, string> = {
  REQUESTOR: 'bg-blue-100 text-blue-700',
  TBRC: 'bg-purple-100 text-purple-700',
  PRODUCTION: 'bg-orange-100 text-orange-700',
  WAREHOUSING: 'bg-yellow-100 text-yellow-700',
  FINANCE: 'bg-green-100 text-green-700',
  SALES: 'bg-pink-100 text-pink-700',
  COMMERCIALS: 'bg-indigo-100 text-indigo-700',
  QUALITY: 'bg-teal-100 text-teal-700',
  MDM: 'bg-red-100 text-red-700',
  CFO: 'bg-emerald-100 text-emerald-700',
  MANAGER: 'bg-cyan-100 text-cyan-700',
  ADMIN: 'bg-gray-100 text-gray-700',
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [editUser, setEditUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', department: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'REQUESTOR',
    department: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = async () => {
    const [usersRes, statsRes] = await Promise.all([
      usersService.findAll(),
      usersService.getStats(),
    ])
    setUsers(usersRes.data)
    setStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      setErrorMsg('Name, Email आणि Password required आहे')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    try {
      await usersService.createUser(createForm)
      setSuccessMsg(`✅ ${createForm.name} successfully created!`)
      setCreateForm({ name: '', email: '', password: '', role: 'REQUESTOR', department: '' })
      setShowCreateModal(false)
      await fetchData()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'User create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: any) => {
    setEditUser(user)
    setEditForm({ name: user.name, role: user.role, department: user.department || '' })
  }

  const handleUpdate = async () => {
    if (!editUser) return
    setSubmitting(true)
    try {
      await usersService.updateUser(editUser.id, editForm)
      await fetchData()
      setEditUser(null)
      setSuccessMsg('✅ User updated successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (user: any) => {
    setSubmitting(true)
    try {
      await usersService.updateUser(user.id, { isActive: !user.isActive })
      await fetchData()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-500 text-sm">Admin — Manage all system users</p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setErrorMsg('') }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus size={16} />
          Create User
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {successMsg}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-blue-600' },
            { label: 'Active', value: stats.active, color: 'text-green-600' },
            { label: 'Inactive', value: stats.inactive, color: 'text-red-500' },
            { label: 'Total Roles', value: ROLES.length, color: 'text-purple-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Role Distribution */}
      {stats && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Role Distribution</h2>
          <div className="flex flex-wrap gap-2">
            {stats.roleStats.map((r: any) => (
              <div
                key={r.role}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer
                  ${roleColors[r.role] || 'bg-gray-100 text-gray-700'}`}
                onClick={() => setRoleFilter(r.role)}
              >
                {r.role}
                <span className="bg-white bg-opacity-60 px-1.5 py-0.5 rounded-full font-bold">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {roleFilter !== 'ALL' && (
          <button
            onClick={() => setRoleFilter('ALL')}
            className="text-sm text-red-500 hover:text-red-700 px-3"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing <span className="font-medium text-gray-900">{filtered.length}</span> of{' '}
        <span className="font-medium text-gray-900">{users.length}</span> users
      </p>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition ${!user.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.department || '—'}</td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={submitting}
                        className={`transition ${user.isActive
                          ? 'text-red-400 hover:text-red-600'
                          : 'text-green-400 hover:text-green-600'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========== CREATE USER MODAL ========== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
              <button
                onClick={() => { setShowCreateModal(false); setErrorMsg('') }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="rahul@nexus.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {createForm.role === 'REQUESTOR' && '📋 Material + Vendor requests तयार करू शकतो'}
                  {createForm.role === 'TBRC' && '🔍 Material Step 1 approve करतो'}
                  {createForm.role === 'PRODUCTION' && '🏭 Material Step 2 approve करतो'}
                  {createForm.role === 'WAREHOUSING' && '📦 Material Step 3 approve करतो'}
                  {createForm.role === 'FINANCE' && '💰 Material Step 4 + Vendor approve करतो'}
                  {createForm.role === 'SALES' && '🛒 Material Step 5 approve करतो'}
                  {createForm.role === 'COMMERCIALS' && '💼 Material Step 6 + Vendor approve करतो'}
                  {createForm.role === 'QUALITY' && '✅ Material Step 7 + Vendor approve करतो'}
                  {createForm.role === 'MDM' && '🎯 Material Final Step 8 + Vendor approve करतो'}
                  {createForm.role === 'MANAGER' && '👔 Vendor approve + KPI reports पाहतो'}
                  {createForm.role === 'CFO' && '💎 Vendor Final Approval + KPI reports'}
                  {createForm.role === 'ADMIN' && '🔧 Users manage करतो + सगळं access'}
                </p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={createForm.department}
                  onChange={e => setCreateForm({ ...createForm, department: e.target.value })}
                  placeholder="e.g. Procurement, Finance, IT"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setErrorMsg('') }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create User ✅'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT USER MODAL ========== */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}