import api from '../lib/api'

export interface MaterialRequest {
  id: string
  requestNumber: string
  materialDescription: string
  materialType: string
  plant?: string
  priority: string
  status: string
  currentStep: number
  fieldValues: Record<string, any>
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  requestor: {
    id: string
    name: string
    email: string
    role: string
  }
  approvals?: any[]
  comments?: any[]
  documents?: any[]
  stepTimings?: any[]
  _count?: {
    comments: number
    documents: number
  }
}

export const materialsService = {
  create: (data: any) => api.post('/materials', data),
  findAll: () => api.get('/materials'),
  findOne: (id: string) => api.get(`/materials/${id}`),
  getInbox: () => api.get('/materials/inbox'),
  getStats: () => api.get('/materials/stats'),
  takeAction: (id: string, data: any) => api.post(`/materials/${id}/action`, data),
  addComment: (id: string, text: string) => api.post(`/materials/${id}/comment`, { text }),
  getKPIReport: () => api.get('/materials/kpi'),
  getTATReport: () => api.get('/materials/tat-report'),
}