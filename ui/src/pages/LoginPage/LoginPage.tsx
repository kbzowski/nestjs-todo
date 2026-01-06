import { Link } from 'react-router-dom'
import { LoginForm } from '../../components'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Logowanie</h1>
        <LoginForm />
        <p className={styles.link}>
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  )
}
