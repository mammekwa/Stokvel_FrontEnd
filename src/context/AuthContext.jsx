import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth'
import { setAuthTokenGetter, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'stokvelchain_auth'

const parseTokenPayload = (token) => {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

const isTokenValid = (token) => {
  const payload = parseTokenPayload(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, user: null })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return

    const parsed = JSON.parse(saved)
    if (parsed.token && isTokenValid(parsed.token)) {
      setAuth(parsed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    setAuthTokenGetter(() => auth.token)
    setUnauthorizedHandler(() => {
      setAuth({ token: null, user: null })
      localStorage.removeItem(STORAGE_KEY)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    })
  }, [auth.token])

  const persistAuth = (value) => {
    setAuth(value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }

  const login = async (credentials) => {
    const data = await loginRequest(credentials)
    persistAuth({ token: data.token, user: data.user })
    return data
  }

  const register = async (details) => {
    const data = await registerRequest(details)
    persistAuth({ token: data.token, user: data.user })
    return data
  }

  const logout = () => {
    setAuth({ token: null, user: null })
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      role: auth.user?.role || 'member',
      isAuthenticated: Boolean(auth.token),
      login,
      register,
      logout,
    }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
