import { Link } from 'react-router-dom'
import { imageApi } from '../../../api'
import { Button } from '../../common'
import type { Todo } from '../../../types'
import styles from './TodoItem.module.css'

interface TodoItemProps {
  todo: Todo
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onDelete }: TodoItemProps) {
  const handleDelete = () => {
    onDelete(todo.id)
  }

  return (
    <div className={styles.item} data-testid={`todo-item-${todo.id}`}>
      {todo.imageId && (
        <img
          src={imageApi.getUrl(todo.imageId)}
          alt=""
          className={styles.image}
        />
      )}
      <div className={styles.content}>
        <Link to={`/todos/${todo.id}`} className={styles.title}>
          {todo.title}
        </Link>
      </div>
      <div className={styles.actions}>
        <Link to={`/todos/${todo.id}`}>
          <Button variant="secondary" size="small" data-testid={`todo-edit-${todo.id}`}>
            Edytuj
          </Button>
        </Link>
        <Button variant="danger" size="small" onClick={handleDelete} data-testid={`todo-delete-${todo.id}`}>
          Usuń
        </Button>
      </div>
    </div>
  )
}
