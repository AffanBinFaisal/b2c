import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const getErrorMessage = (err, fallbackMessage) => {
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      // FastAPI validation errors are usually returned as detail: [{msg, ...}, ...]
      const messages = detail
        .map((item) => item?.msg)
        .filter(Boolean)
      if (messages.length > 0) {
        return messages.join(', ')
      }
    }
    return fallbackMessage
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await authAPI.getProfile()
        setUser(response.data)
      } catch (err) {
        localStorage.removeItem('token')
        setUser(null)
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authAPI.login({ email, password })
      localStorage.setItem('token', response.data.access_token)
      const profileResponse = await authAPI.getProfile()
      setUser(profileResponse.data)
      return { success: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed')
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (name, email, password) => {
    try {
      setError(null)
      const response = await authAPI.register({ name, email, password })
      const message =
        response.data?.message ||
        'Account created. Check your email to verify before signing in.'
      return { success: true, message }
    } catch (err) {
      const message = getErrorMessage(err, 'Registration failed')
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await authAPI.logout()
      }
    } catch {
      // still clear client session
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateProfile = async (data) => {
    try {
      setError(null)
      const response = await authAPI.updateProfile(data)
      setUser(response.data)
      return { success: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Update failed')
      setError(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
