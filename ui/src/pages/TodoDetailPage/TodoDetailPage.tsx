import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { todoApi } from '../../api'
import { TodoForm, Spinner, ErrorMessage, Button } from '../../components'
import { getErrorMessage } from '../../utils'
import type { Todo, CreateTodoData } from '../../types'
import styles from './TodoDetailPage.module.css'

export function TodoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodo = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await todoApi.getById(Number(id))
      setTodo(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchTodo()
  }, [fetchTodo])

  const handleUpdate = async (data: CreateTodoData) => {
    if (!id) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await todoApi.update(Number(id), data)
      setTodo(updated)
      void navigate('/todos')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!id) return
    todoApi.delete(Number(id))
      .then(() => {
        void navigate('/todos')
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err))
      })
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => { void fetchTodo() }} />
  }

  if (!todo) {
    return <ErrorMessage message="Zadanie nie zostało znalezione" />
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/todos" className={styles.back} data-testid="back-link">← Powrót do listy</Link>
        <h1 className={styles.title}>Edytuj zadanie</h1>
      </div>

      <div className={styles.card}>
        <TodoForm
          initialData={todo}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className={styles.danger}>
        <h3 className={styles.dangerTitle}>Strefa niebezpieczna</h3>
        <p className={styles.dangerText}>Usunięcie zadania jest nieodwracalne.</p>
        <Button variant="danger" onClick={handleDelete} data-testid="delete-todo-button">
          Usuń zadanie
        </Button>
      </div>
    </div>
  )
}
