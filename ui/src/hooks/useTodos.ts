import { useState, useCallback } from 'react'
import { todoApi } from '../api'
import { getErrorMessage } from '../utils'
import type { Todo, TodoQueryParams, CreateTodoData, UpdateTodoData, TodoListResponse } from '../types'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [meta, setMeta] = useState<TodoListResponse['meta'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentParams, setCurrentParams] = useState<TodoQueryParams>({})

  const fetchTodos = useCallback(async (params?: TodoQueryParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await todoApi.getAll(params)
      setTodos(response.data)
      setMeta(response.meta)
      setCurrentParams(params ?? {})
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTodo = useCallback(async (data: CreateTodoData): Promise<Todo | null> => {
    try {
      const todo = await todoApi.create(data)
      await fetchTodos(currentParams)
      return todo
    } catch (err) {
      setError(getErrorMessage(err))
      return null
    }
  }, [fetchTodos, currentParams])

  const updateTodo = useCallback(async (id: number, data: UpdateTodoData): Promise<Todo | null> => {
    try {
      const todo = await todoApi.update(id, data)
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)))
      return todo
    } catch (err) {
      setError(getErrorMessage(err))
      return null
    }
  }, [])

  const deleteTodo = useCallback(async (id: number): Promise<boolean> => {
    try {
      await todoApi.delete(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    }
  }, [])

  const refetch = useCallback(() => fetchTodos(currentParams), [fetchTodos, currentParams])

  return {
    todos,
    meta,
    isLoading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    refetch,
    clearError: () => { setError(null) },
  }
}
