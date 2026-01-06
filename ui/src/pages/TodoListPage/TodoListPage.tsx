import { useEffect, useState, useCallback } from 'react'
import { useTodos } from '../../hooks'
import { TodoList, TodoForm, TodoFilters, Pagination, Spinner, ErrorMessage, Modal, Button } from '../../components'
import type { TodoQueryParams, CreateTodoData } from '../../types'
import styles from './TodoListPage.module.css'

export function TodoListPage() {
  const { todos, meta, isLoading, error, fetchTodos, createTodo, deleteTodo, clearError } = useTodos()
  const [params, setParams] = useState<TodoQueryParams>({ page: 1, limit: 10, sortOrder: 'desc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void fetchTodos(params)
  }, [fetchTodos, params])

  const handleFilter = useCallback((newParams: TodoQueryParams) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }, [])

  const handleCreate = async (data: CreateTodoData) => {
    setIsSubmitting(true)
    const result = await createTodo(data)
    setIsSubmitting(false)
    if (result) {
      setIsModalOpen(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteTodo(id)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Moje zadania</h1>
        <Button onClick={() => { setIsModalOpen(true) }} data-testid="add-todo-button">Dodaj zadanie</Button>
      </div>

      <TodoFilters initialParams={params} onFilter={handleFilter} />

      {error && <ErrorMessage message={error} onRetry={() => { clearError(); void fetchTodos(params) }} />}

      {isLoading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : (
        <>
          <TodoList todos={todos} onDelete={(id) => { void handleDelete(id) }} />
          {meta && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false) }} title="Nowe zadanie">
        <TodoForm
          onSubmit={handleCreate}
          onCancel={() => { setIsModalOpen(false) }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
