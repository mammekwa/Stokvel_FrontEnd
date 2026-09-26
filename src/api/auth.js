import { apiClient } from './client'

export const register = async (payload) => {
  const { data } = await apiClient.post('/auth/register', payload)
  return data
}

export const login = async (payload) => {
  const { data } = await apiClient.post('/auth/login', payload)
  return data
}
