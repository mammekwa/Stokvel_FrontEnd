import { apiClient } from './client'

export const getUserProfile = async (id) => {
  const { data } = await apiClient.get(`/users/${id}`)
  return data
}
