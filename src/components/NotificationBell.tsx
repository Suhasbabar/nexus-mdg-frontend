import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, X } from 'lucide-react'
import { notificationsService } from '../services/notifications.service'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

const typeConfig: Record<string, { bg: string; border: string; dot: string }> = {
  INFO: { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
  SUCCESS: { bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500' },
  WARNING: { bg: 'bg-yellow-50', border: 'border-yellow-100', dot: 'bg-yellow-500' },
  ERROR: { bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' },
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsService.getUnreadCount()
      setUnreadCount(res.data.count)
    } catch (err) {}
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationsService.findAll()
      setNotifications(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) fetchNotifications()
  }

  const handleMarkAsRead = async (id: string, link?: string) => {
    await notificationsService.markAsRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    if (link) {
      setIsOpen(false)
      navigate(link)
    }
  }

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => {
                  const config = typeConfig[notif.type] || typeConfig.INFO
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.link)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition
                        ${!notif.isRead ? config.bg : ''}`}
                    >
                      <div className="flex-shrink-0 mt-1.5">
                        <div className={`w-2 h-2 rounded-full ${!notif.isRead ? config.dot : 'bg-gray-200'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${config.dot} mt-2`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Showing last 50 notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}