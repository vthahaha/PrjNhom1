import api from './axiosInstance'

// ── AUTH ──────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${email}`),
  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`),
  firstLoginChange: (newPassword) =>
    api.post(`/auth/first-login-change?newPassword=${newPassword}`),
}

// ── ROOMS ─────────────────────────────────────────────────
export const roomApi = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  updateStatus: (id, trangThai) =>
    api.patch(`/rooms/${id}/status`, null, { params: { trangThai } }),
  getServices: (id) => api.get(`/rooms/${id}/services`),
  updateServices: (id, data) => api.put(`/rooms/${id}/services`, data),
}

// ── TENANTS ───────────────────────────────────────────────
export const tenantApi = {
  getAll: () => api.get('/tenants'),
  getById: (id) => api.get(`/tenants/${id}`),
  create: (data) => api.post('/tenants', data),
  update: (id, data) => api.put(`/tenants/${id}`, data),
  delete: (id) => api.delete(`/tenants/${id}`),
  getContracts: (id) => api.get(`/tenants/${id}/contracts`),
  getMe: () => api.get('/me'),
  updateMe: (data) => api.put('/me', data),
}

// ── CONTRACTS ─────────────────────────────────────────────
export const contractApi = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  terminate: (id, data) => api.patch(`/contracts/${id}/terminate`, data),
  renew: (id, data) => api.patch(`/contracts/${id}/renew`, data),
  getExpiringSoon: () => api.get('/contracts/expiring-soon'),
  getMyContract: () => api.get('/contracts/me'),
  uploadDocument: (id, formData) => api.post(`/contracts/${id}/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => api.delete(`/contracts/${id}/upload-document`),
}

// ── INVOICES ──────────────────────────────────────────────
export const invoiceApi = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  markPaid: (id) => api.patch(`/invoices/${id}/paid`),
  getMyInvoices: () => api.get('/me/invoices'),
  getUtilityPrices: () => api.get('/utility-prices'),
  setUtilityPrice: (data) => api.post('/utility-prices', data),
  generateMonthly: (thang, nam) => api.post('/invoices/generate-monthly', null, { params: { thang, nam } }),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  sendBulk: (thang, nam) => api.post('/invoices/send-bulk', null, { params: { thang, nam } }),
}

// ── SERVICES ──────────────────────────────────────────────
export const serviceApi = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

// ── REPAIR REQUESTS ───────────────────────────────────────
export const repairApi = {
  getAll: (params) => api.get('/repair-requests', { params }),
  create: (data) => api.post('/repair-requests', data),
  update: (id, data) => api.patch(`/repair-requests/${id}`, data),
  getMine: () => api.get('/me/repair-requests'),
}

// ── DASHBOARD ─────────────────────────────────────────────
export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getRevenue: (year) => api.get('/dashboard/revenue', { params: { year } }),
  getExpiringContracts: () => api.get('/dashboard/expiring-contracts'),
  getUnpaidInvoices: () => api.get('/dashboard/unpaid-invoices'),
  getFinanceStats: (params) => api.get('/dashboard/finance-stats', { params }),
}

// ── PUBLIC ────────────────────────────────────────────────
export const publicApi = {
  getRooms: () => api.get('/public/rooms'),
  getRoomById: (id) => api.get(`/public/rooms/${id}`),
}
