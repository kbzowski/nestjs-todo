import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Layout, ProtectedRoute } from '../components'
import { LoginPage, RegisterPage, TodoListPage, TodoDetailPage, NotFoundPage } from '../pages'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/todos" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/todos', element: <TodoListPage /> },
      { path: '/todos/:id', element: <TodoDetailPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
