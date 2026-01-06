import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks'
import { Button } from '../../common'
import styles from './Header.module.css'

export function Header() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    void logout()
  }

  return (
    <header className={styles.header}>
      <Link to="/todos" className={styles.logo}>
        Todo App
      </Link>
      <nav className={styles.nav}>
        {user && (
          <>
            <span className={styles.email} data-testid="user-email">{user.email}</span>
            <Button variant="secondary" size="small" onClick={handleLogout} data-testid="logout-button">
              Wyloguj
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
