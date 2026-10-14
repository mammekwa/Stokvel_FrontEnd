import { apiClient, unwrap } from './client'

// AuthResponse: { userId?, token, role }
export const login = (credentials) => unwrap(apiClient.post('/auth/login', credentials))

// RegisterRequest: { fullName, email, phone, password, nationalId }
export const register = (details) => unwrap(apiClient.post('/auth/register', details))
