import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

let getToken = () => null
let handleUnauthorized = () => {}

export const setAuthTokenGetter = (getter) => {
  getToken = getter
}

export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier can take ~60s to wake up.
  timeout: 70000,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token && !config.url?.startsWith('/auth/')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Every error that leaves the API layer has the same shape (NFR-01):
// { status, message, details: string[] }
const normalizeError = (error) => {
  const status = error?.response?.status ?? null
  const body = error?.response?.data

  if (!error?.response) {
    const message = error?.code === 'ECONNABORTED'
      ? 'The server took too long to respond. It may be waking up — please try again.'
      : 'Cannot reach the server. Check your connection and that the backend is running.'
    return { status, message, details: [] }
  }

  if (status === 401) {
    return { status, message: body?.message || 'Your session has expired. Please log in again.', details: [] }
  }

  if (status === 403 && !body?.message) {
    return { status, message: 'You do not have permission to do this.', details: [] }
  }

  return {
    status,
    message: body?.message || 'Something went wrong. Please try again.',
    details: Array.isArray(body?.details) ? body.details : [],
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAttempt = error?.config?.url?.startsWith('/auth/')
    if (error?.response?.status === 401 && !isLoginAttempt) {
      handleUnauthorized()
    }
    return Promise.reject(normalizeError(error))
  },
)

export const unwrap = (request) => request.then((response) => response.data)
