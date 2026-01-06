import type { ReactElement, ReactNode } from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Wrapper zapewniający kontekst routera dla komponentów używających Link/NavLink
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

/**
 * Dedykowana funkcja render z wbudowanymi providerami
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-eksport wszystkiego z testing-library
export * from '@testing-library/react'
export { customRender as render }
