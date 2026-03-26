import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests and check authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    // List of endpoints that don't require authentication
    const publicEndpoints = ['/auth/register', '/auth/login']
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    )
    
    // If no token and not a public endpoint, redirect to login
    if (!token && !isPublicEndpoint) {
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      return Promise.reject(new Error('Not authenticated'))
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/me'),
}

// Collections API
export const collectionsAPI = {
  getAll: () => api.get('/collections'),
  getById: (id) => api.get(`/collections/${id}`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
}

// Notes API
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  pin: (id) => api.post(`/notes/${id}/pin`),
  unpin: (id) => api.post(`/notes/${id}/unpin`),
}

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  getById: (id) => api.get(`/tags/${id}`),
  create: (data) => api.post('/tags', data),
  delete: (id) => api.delete(`/tags/${id}`),
}

// Search API
export const searchAPI = {
  search: (data) => api.post('/search', data),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  exportData: () => api.get('/analytics/export'),
}

export default api
