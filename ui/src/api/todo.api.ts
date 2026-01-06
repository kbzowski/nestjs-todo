import { apiClient } from './client'
import type { Todo, CreateTodoData, UpdateTodoData, TodoQueryParams, TodoListResponse } from '../types'

export const todoApi = {
  getAll: (params?: TodoQueryParams): Promise<TodoListResponse> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return apiClient.get(`/todo${query ? `?${query}` : ''}`)
  },

  getById: (id: number): Promise<Todo> =>
    apiClient.get(`/todo/${id}`),

  create: (data: CreateTodoData): Promise<Todo> =>
    apiClient.post('/todo', data),

  update: (id: number, data: UpdateTodoData): Promise<Todo> =>
    apiClient.put(`/todo/${id}`, data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/todo/${id}`),
}
