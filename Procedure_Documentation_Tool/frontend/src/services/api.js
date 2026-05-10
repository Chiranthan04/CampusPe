import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach JWT token ────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const url     = error.config?.url || ''

    // ✅ ONLY redirect to login if:
    // 1. Status is 401
    // 2. NOT on auth endpoints (login/register)
    // 3. User has a token (meaning session expired)
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (status === 401 && !isAuthEndpoint && localStorage.getItem('token')) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:    (data)  => api.post('/auth/login',    data),
  register: (data)  => api.post('/auth/register', data),
  refresh:  (token) => api.post(`/auth/refresh?refreshToken=${token}`),
}

// ── Procedures ────────────────────────────────────────────────
export const procedureAPI = {
  getAll: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') =>
    api.get(`/procedures?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id) =>
    api.get(`/procedures/${id}`),

  search: (query, page = 0, size = 10) =>
    api.get(`/procedures?search=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  filterByStatus: (status, page = 0, size = 10) =>
    api.get(`/procedures?status=${status}&page=${page}&size=${size}`),

  create: (data) =>
    api.post('/procedures', data),

  update: (id, data) =>
    api.put(`/procedures/${id}`, data),

  delete: (id) =>
    api.delete(`/procedures/${id}`),

  getStats: () =>
    api.get('/procedures/stats'),

  getAuditLogs: (id) =>
    api.get(`/procedures/${id}/audit-logs`),
}

export default api
