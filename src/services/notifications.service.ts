import api from '../lib/api'

export const notificationsService = {
  findAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  cleanup: () => api.delete('/notifications/cleanup'),
}