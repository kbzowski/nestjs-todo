import { Link } from 'react-router-dom'
import { Button } from '../../components'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Strona nie została znaleziona</p>
      <Link to="/">
        <Button>Wróć do strony głównej</Button>
      </Link>
    </div>
  )
}
