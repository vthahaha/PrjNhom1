import axios from 'axios'

export const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL
  if (!url) return '/api'
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  return url.endsWith('/api') ? url : `${url}/api`
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
