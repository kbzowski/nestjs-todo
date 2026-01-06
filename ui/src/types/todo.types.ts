import type { Image } from './image.types'

export interface Todo {
  id: number
  title: string
  imageId: number | null
  image: Image | null
  userId: number
}

export interface CreateTodoData {
  title: string
  imageId?: number
}

export interface UpdateTodoData {
  title?: string
  imageId?: number | null
}

export interface TodoQueryParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: 'id' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface TodoListResponse {
  data: Todo[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
