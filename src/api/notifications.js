import { apiClient, unwrap } from './client'

export const getNotifications = () => unwrap(apiClient.get('/notifications'))

export const getUnreadCount = async () => {
  const data = await unwrap(apiClient.get('/notifications/unread-count'))
  return data?.unread ?? 0
}

export const markAsRead = (notificationId) => unwrap(apiClient.patch(`/notifications/${notificationId}/read`))
