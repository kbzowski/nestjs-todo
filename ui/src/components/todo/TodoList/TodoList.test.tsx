import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import { TodoList } from './TodoList'
import type { Todo } from '../../../types'

const mockTodos: Todo[] = [
  { id: 1, title: 'Pierwsze zadanie', imageId: null, image: null, userId: 1 },
  { id: 2, title: 'Drugie zadanie', imageId: null, image: null, userId: 1 },
  { id: 3, title: 'Trzecie zadanie', imageId: null, image: null, userId: 1 },
]

describe('TodoList', () => {
  // 1. Testowanie renderowania listy elementów
  it('renders all todos from the array', () => {
    render(<TodoList todos={mockTodos} onDelete={vi.fn()} />)

    expect(screen.getByText('Pierwsze zadanie')).toBeInTheDocument()
    expect(screen.getByText('Drugie zadanie')).toBeInTheDocument()
    expect(screen.getByText('Trzecie zadanie')).toBeInTheDocument()
  })

  // 2. Testowanie pustego stanu (empty state)
  it('displays empty state when list is empty', () => {
    render(<TodoList todos={[]} onDelete={vi.fn()} />)

    expect(screen.getByText('Brak zadań do wyświetlenia')).toBeInTheDocument()
  })

  // 3. Testowanie z użyciem regex w selektorze
  it('renders correct number of todo items', () => {
    render(<TodoList todos={mockTodos} onDelete={vi.fn()} />)

    // getAllByTestId z regex - przydatne przy dynamicznych ID
    const items = screen.getAllByTestId(/^todo-item-/)
    expect(items).toHaveLength(3)
  })
})
