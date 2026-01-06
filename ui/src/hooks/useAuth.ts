import { useContext } from 'react'
import { AuthContext } from '../context'
import { authApi } from '../api'
import type { LoginCredentials } from '../types'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth musi być użyty wewnątrz AuthProvider')
  }

  const { user, isAuthenticated, isLoading, setUser } = context

  const login = async (credentials: LoginCredentials) => {
    await authApi.login(credentials)
    const loggedUser = await authApi.me()
    setUser(loggedUser)
  }

  const logout = async () => {
    await authApi.logout().catch(() => { /* ignore */ })
    setUser(null)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register: authApi.register,
    logout,
  }
}
