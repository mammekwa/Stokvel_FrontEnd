import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

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
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register')
  if (!isAuthRoute) {
    const token = getToken()
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
  }
  return config
})

const normalizeError = (error) => {
  const backendError = error?.response?.data
  if (backendError?.message) {
    return { field: backendError.field ?? null, message: backendError.message }
  }

  if (error?.response?.status === 401) {
    return { field: null, message: 'Your session has expired. Please log in again.' }
  }

  return { field: null, message: 'Something went wrong. Please try again.' }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(normalizeError(error))
  },
)

export const withMockFallback = async (requestFn, mockFn) => {
  if (USE_MOCKS) {
    return mockFn()
  }

  try {
    return await requestFn()
  } catch (error) {
    if (import.meta.env.DEV) {
      return mockFn()
    }
    throw error
  }
}

export const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms))
