import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

import AdminLayout from '../components/layout/AdminLayout'
import TenantLayout from '../components/layout/TenantLayout'

import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'
import PublicRoomsPage from '../pages/public/PublicRoomsPage'
import FirstLoginPage from '../pages/public/FirstLoginPage'

import DashboardPage from '../pages/admin/DashboardPage'
import RoomsPage from '../pages/admin/RoomsPage'
import TenantsPage from '../pages/admin/TenantsPage'
import ContractsPage from '../pages/admin/ContractsPage'
import InvoicesPage from '../pages/admin/InvoicesPage'
import ServicesPage from '../pages/admin/ServicesPage'
import RepairRequestsAdminPage from '../pages/admin/RepairRequestsAdminPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'

import MyContractPage from '../pages/tenant/MyContractPage'
import MyInvoicesPage from '../pages/tenant/MyInvoicesPage'
import MyRepairRequestsPage from '../pages/tenant/MyRepairRequestsPage'
import SettingsPage from '../pages/tenant/SettingsPage'
import TenantDashboardPage from '../pages/tenant/TenantDashboardPage'

// Route guards
function RequireAuth({ children, role }) {
  const { user, needsPasswordChange } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (needsPasswordChange) return <Navigate to="/first-login" replace />
  if (role && user.vaiTro !== role) return <Navigate to="/" replace />
  return children
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/first-login', element: <FirstLoginPage /> },
  { path: '/phong-trong', element: <PublicRoomsPage /> },

  // Admin routes
  {
    path: '/admin',
    element: <RequireAuth role="ADMIN"><AdminLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'phong', element: <RoomsPage /> },
      { path: 'khach-thue', element: <TenantsPage /> },
      { path: 'hop-dong', element: <ContractsPage /> },
      { path: 'hoa-don', element: <InvoicesPage /> },
      { path: 'dich-vu', element: <ServicesPage /> },
      { path: 'sua-chua', element: <RepairRequestsAdminPage /> },
      { path: 'cai-dat', element: <AdminSettingsPage /> },
    ],
  },

  // Tenant routes
  {
    path: '/tenant',
    element: <RequireAuth role="TENANT"><TenantLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/tenant/dashboard" replace /> },
      { path: 'dashboard', element: <TenantDashboardPage /> },
      { path: 'hop-dong', element: <MyContractPage /> },
      { path: 'hoa-don', element: <MyInvoicesPage /> },
      { path: 'sua-chua', element: <MyRepairRequestsPage /> },
      { path: 'cai-dat', element: <SettingsPage /> },
    ],
  },

  // Default redirect
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
])
