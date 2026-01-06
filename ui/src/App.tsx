import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context'
import { ErrorBoundary } from './components'
import { router } from './router'

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
