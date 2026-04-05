import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewRequestPage from './pages/materials/NewRequestPage'
import MyRequestsPage from './pages/materials/MyRequestsPage'
import RequestDetailPage from './pages/materials/RequestDetailPage'
import InboxPage from './pages/materials/InboxPage'
import AllRequestsPage from './pages/materials/AllRequestsPage'
import NewVendorPage from './pages/vendors/NewVendorPage'
import AllVendorsPage from './pages/vendors/AllVendorsPage'
import VendorDetailPage from './pages/vendors/VendorDetailPage'
import VendorPortalPage from './pages/vendors/VendorPortalPage'
import KPIDashboardPage from './pages/reports/KPIDashboardPage'
import UsersPage from './pages/admin/UsersPage'
import TATReportPage from './pages/reports/TATReportPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public — Vendor Portal */}
      <Route path="/vendor-portal/:token" element={<VendorPortalPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />

      {/* Material Master */}
      <Route path="/materials/new" element={<ProtectedRoute><NewRequestPage /></ProtectedRoute>} />
      <Route path="/materials/my" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
      <Route path="/materials/all" element={<ProtectedRoute><AllRequestsPage /></ProtectedRoute>} />
      <Route path="/materials/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />

      {/* Vendor Onboarding */}
      <Route path="/vendors/new" element={<ProtectedRoute><NewVendorPage /></ProtectedRoute>} />
      <Route path="/vendors/all" element={<ProtectedRoute><AllVendorsPage /></ProtectedRoute>} />
      <Route path="/vendors/:id" element={<ProtectedRoute><VendorDetailPage /></ProtectedRoute>} />


      <Route path="/reports/kpi" element={<ProtectedRoute><KPIDashboardPage /></ProtectedRoute>} />
      <Route path="/reports/tat" element={<ProtectedRoute><TATReportPage /></ProtectedRoute>} />

      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      
      
      <Route path="*" element={<Navigate to="/dashboard" />} />
      
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App