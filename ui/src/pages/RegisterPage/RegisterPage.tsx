import { RegisterForm } from '../../components'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Rejestracja</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
