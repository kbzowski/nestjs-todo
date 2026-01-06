import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  // 1. Testowanie klas CSS w zależności od props
  it('applies correct CSS classes based on variant and size props', () => {
    const { rerender } = render(<Button>Click me</Button>)

    const button = screen.getByRole('button')

    // Domyślne wartości: primary + medium
    expect(button.className).toMatch(/primary/)
    expect(button.className).toMatch(/medium/)

    // Zmiana wariantu na danger i size na small
    rerender(<Button variant="danger" size="small">Click me</Button>)
    expect(button.className).toMatch(/danger/)
    expect(button.className).toMatch(/small/)
  })

  // 2. Testowanie stanu ładowania (isLoading)
  it('shows spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>)

    const button = screen.getByRole('button')

    // Przycisk jest zablokowany podczas ładowania
    expect(button).toBeDisabled()

    // Tekst jest ukryty, pokazany jest spinner
    expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    expect(button.querySelector('span')).toBeInTheDocument() // spinner
  })

  // 3. Testowanie przekazywania natywnych atrybutów (spread props)
  it('passes native button attributes through', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button type="submit" onClick={onClick} data-testid="my-button">
        Send
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('data-testid', 'my-button')

    await user.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  // 4. Testowanie fullWidth
  it('applies fullWidth class when prop is true', () => {
    const { rerender } = render(<Button>Normal</Button>)
    const button = screen.getByRole('button')

    expect(button.className).not.toMatch(/fullWidth/)

    rerender(<Button fullWidth>Full</Button>)
    expect(button.className).toMatch(/fullWidth/)
  })
})
