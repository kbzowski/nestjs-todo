import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'small' | 'medium'
  fullScreen?: boolean
}

export function Spinner({ size = 'medium', fullScreen = false }: SpinnerProps) {
  const spinner = <div className={`${styles.spinner} ${styles[size]}`} />
  return fullScreen ? <div className={styles.fullScreen}>{spinner}</div> : spinner
}
