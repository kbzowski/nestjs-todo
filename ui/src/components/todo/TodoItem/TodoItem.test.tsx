import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { TodoItem } from './TodoItem'
import type { Todo } from '../../../types'

const mockTodo: Todo = {
  id: 1,
  title: 'Zrobić zakupy',
  imageId: null,
  image: null,
  userId: 1,
}

describe('TodoItem', () => {
  // 1. Testowanie renderowania i atrybutów
  it('renders todo title as a link to details', () => {
    render(<TodoItem todo={mockTodo} onDelete={vi.fn()} />)

    const titleLink = screen.getByRole('link', { name: 'Zrobić zakupy' })
    expect(titleLink).toHaveAttribute('href', '/todos/1')
  })

  // 2. Testowanie interakcji użytkownika i callbacków
  it('calls onDelete callback with todo id when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<TodoItem todo={mockTodo} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Usuń' }))

    expect(onDelete).toHaveBeenCalledWith(1)
  })

  // 3. Testowanie renderowania warunkowego
  it('renders image only when imageId is provided', () => {
    const todoWithImage: Todo = { ...mockTodo, imageId: 42 }

    const { container, rerender } = render(
      <TodoItem todo={mockTodo} onDelete={vi.fn()} />,
    )
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(<TodoItem todo={todoWithImage} onDelete={vi.fn()} />)
    expect(container.querySelector('img')).toBeInTheDocument()
  })
})
