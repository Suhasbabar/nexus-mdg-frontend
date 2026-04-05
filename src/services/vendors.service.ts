import api from '../lib/api'

export interface VendorRequest {
  id: string
  requestNumber: string
  vendorName: string
  panNumber: string
  gstNumber?: string
  email: string
  mobile?: string
  status: string
  portalToken?: string
  fieldValues: Record<string, any>
  createdAt: string
  updatedAt: string
  completedAt?: string
  vendorApprovals?: any[]
  documents?: any[]
  approvalStatus?: {
    department: string
    status: string
    comment?: string
    timestamp?: string
  }[]
}

export const vendorsService = {
  create: (data: any) => api.post('/vendors', data),
  findAll: () => api.get('/vendors'),
  findOne: (id: string) => api.get(`/vendors/${id}`),
  getStats: () => api.get('/vendors/stats'),
  reviewVendorData: (id: string) => api.post(`/vendors/${id}/review`),
  takeAction: (id: string, data: any) => api.post(`/vendors/${id}/action`, data),
  cfoApproval: (id: string, data: any) => api.post(`/vendors/${id}/cfo-approval`, data),
  getByToken: (token: string) => api.get(`/vendors/portal/${token}`),
  vendorPortalSubmit: (token: string, data: any) => api.post(`/vendors/portal/${token}/submit`, data),
}