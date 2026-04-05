import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Inbox, ClipboardList,
  Users, BarChart3, LogOut, Menu, X, ChevronRight,
  Building2, TrendingUp
} from 'lucide-react'
import NotificationBell from './NotificationBell'

const menuItems = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ALL'] },
      { label: 'My Inbox', icon: Inbox, path: '/inbox', roles: ['ALL'] },
    ]
  },
  {
    group: 'Material Master',
    items: [
      { label: 'New Request', icon: FileText, path: '/materials/new', roles: ['REQUESTOR'] },
      { label: 'My Requests', icon: ClipboardList, path: '/materials/my', roles: ['REQUESTOR'] },
      { label: 'All Requests', icon: ClipboardList, path: '/materials/all', roles: ['ADMIN', 'MDM', 'MANAGER', 'CFO'] },
    ]
  },
  {
    group: 'Vendor Onboarding',
    items: [
      { label: 'New Vendor', icon: Building2, path: '/vendors/new', roles: ['REQUESTOR'] },
      { label: 'All Vendors', icon: Building2, path: '/vendors/all', roles: ['ADMIN', 'MDM', 'MANAGER', 'CFO'] },
    ]
  },
  {
    group: 'Reports',
    items: [
      { label: 'KPI Dashboard', icon: TrendingUp, path: '/reports/kpi', roles: ['MANAGER', 'CFO', 'ADMIN'] },
      { label: 'TAT Report', icon: BarChart3, path: '/reports/tat', roles: ['MANAGER', 'CFO', 'ADMIN'] },
      { label: 'Users', icon: Users, path: '/users', roles: ['ADMIN'] },
    ]
  },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAllowed = (roles: string[]) => {
    if (roles.includes('ALL')) return true
    return roles.includes(user?.role || '')
  }

  const isActive = (path: string) => location.pathname === path

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
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
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-gray-900 text-sm">Nexus MDG</p>
              <p className="text-xs text-gray-400">Master Data Gov.</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((group) => (
            <div key={group.group} className="mb-4">
              {sidebarOpen && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                if (!isAllowed(item.roles)) return null
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {isActive(item.path) && <ChevronRight size={14} />}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-gray-400 hover:text-red-500 transition py-1"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
             <span className="text-sm text-gray-500">
              <NotificationBell />
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}