import api from '../lib/api'

export const usersService = {
  findAll: () => api.get('/users'),
  getStats: () => api.get('/users/stats'),
  createUser: (data: any) => api.post('/users/create', data),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
}