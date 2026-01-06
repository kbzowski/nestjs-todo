import { apiClient } from './client'
import type { User, MessageResponse, RegisterData, LoginCredentials } from '../types'

export const authApi = {
  register: (data: RegisterData): Promise<User> =>
    apiClient.post('/auth/register', data),

  login: async (credentials: LoginCredentials): Promise<MessageResponse> => {
    await apiClient.loginWithBasicAuth(credentials.email, credentials.password)
    return { message: 'Zalogowano pomyślnie' }
  },

  logout: (): Promise<MessageResponse> =>
    apiClient.post('/auth/logout'),

  me: (): Promise<User> =>
    apiClient.get('/auth/me'),
}
