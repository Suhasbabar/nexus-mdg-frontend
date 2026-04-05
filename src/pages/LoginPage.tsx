import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const demoUsers = [
  { role: 'Requestor', email: 'requestor@nexus.com', color: 'bg-blue-500' },
  { role: 'MDM', email: 'mdm@nexus.com', color: 'bg-purple-500' },
  { role: 'CFO', email: 'cfo@nexus.com', color: 'bg-emerald-500' },
  { role: 'Admin', email: 'admin@nexus.com', color: 'bg-gray-600' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', data)
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', 'password123')
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden flex-col justify-between p-12">

        {/* Background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">Nexus MDG</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            SAP Master Data<br />
            <span className="text-blue-200">Governance System</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Streamline your material master and vendor onboarding workflows with intelligent automation.
          </p>

          {/* Feature Pills */}
          <div className="space-y-3">
            {[
              '✅ 8-Step Material Master Workflow',
              '🏢 Vendor Onboarding Portal',
              '📊 Real-time KPI Dashboard',
              '🔔 Smart Notifications',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 bg-white bg-opacity-10 rounded-xl px-4 py-3">
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '12', label: 'Roles' },
            { value: '8', label: 'Workflow Steps' },
            { value: '100%', label: 'Automated' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-blue-300 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Nexus MDG</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@nexus.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white transition placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white transition placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold py-3 rounded-xl transition
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Quick Demo Access</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo Users */}
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map(user => (
              <button
                key={user.email}
                onClick={() => fillDemo(user.email)}
                className="flex items-center gap-2.5 p-3 bg-white border border-gray-200
                  rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left group"
              >
                <div className={`w-7 h-7 ${user.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">
                    {user.role.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">
                    {user.role}
                  </p>
                  <p className="text-xs text-gray-400">Click to fill</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Nexus MDG © 2026 · SAP Master Data Governance
          </p>
        </div>
      </div>
    </div>
  )
}