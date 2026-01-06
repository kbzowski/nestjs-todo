import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  // 1. Testowanie gdy komponent zwraca null
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  // 2. Testowanie stanu disabled
  it('disables Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Poprzednia' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Następna' })).toBeEnabled()
  })

  // 3. Testowanie interakcji i callbacka z argumentem
  it('calls onPageChange with correct page number', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Następna' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Poprzednia' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  // 4. Testowanie złożonej logiki renderowania
  it('displays ellipsis for many pages', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)

    // Sprawdzamy czy wyświetla: 1 ... 4 5 6 ... 10
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getAllByText('...')).toHaveLength(2)
  })
})
