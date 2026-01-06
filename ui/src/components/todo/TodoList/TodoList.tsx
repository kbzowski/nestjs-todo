import { TodoItem } from '../TodoItem'
import type { Todo } from '../../../types'
import styles from './TodoList.module.css'

interface TodoListProps {
  todos: Todo[]
  onDelete: (id: number) => void
}

export function TodoList({ todos, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className={styles.empty} data-testid="todo-list-empty">
        <p>Brak zadań do wyświetlenia</p>
      </div>
    )
  }

  return (
    <div className={styles.list} data-testid="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onDelete={onDelete} />
      ))}
    </div>
  )
}
