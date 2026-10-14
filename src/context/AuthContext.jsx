import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth'
import { setAuthTokenGetter, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'stokvelchain_auth'

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

const isExpired = (claims) => Boolean(claims?.exp) && claims.exp * 1000 <= Date.now()

// The JWT carries everything we need: sub = userId, email, role, exp.
const sessionFromToken = (token, extra = {}) => {
  const claims = decodeToken(token)
  if (!claims || isExpired(claims)) return null
  return {
    token,
    user: {
      userId: claims.sub,
      email: claims.email,
      role: claims.role,
      fullName: extra.fullName || null,
    },
  }
}

// Read synchronously so a page refresh doesn't bounce a logged-in user to /login.
const loadSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return saved?.token ? sessionFromToken(saved.token, saved.user || {}) : null
  } catch {
    return null
  }
}

const saveSession = (session) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable (private mode) — the session still works until refresh.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  const updateSession = useCallback((next) => {
    setSession(next)
    saveSession(next)
  }, [])

  const logout = useCallback(() => updateSession(null), [updateSession])

  useEffect(() => {
    setAuthTokenGetter(() => session?.token ?? null)
  }, [session])

  useEffect(() => {
    // A 401 from any request ends the session; ProtectedRoute then redirects to /login.
    setUnauthorizedHandler(logout)
  }, [logout])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    const next = sessionFromToken(data.token)
    if (!next) throw { message: 'The server returned an invalid session token.', details: [] }
    updateSession(next)
    return next
  }, [updateSession])

  const register = useCallback(async (details) => {
    const data = await registerRequest(details)
    const next = sessionFromToken(data.token, { fullName: details.fullName })
    if (!next) throw { message: 'The server returned an invalid session token.', details: [] }
    updateSession(next)
    return next
  }, [updateSession])

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
