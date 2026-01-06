import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) dialog.showModal()
    else dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
      onCancel={onClose}
      data-testid="modal"
    >
      <div className={styles.content}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" className={styles.close} onClick={onClose} data-testid="modal-close">×</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  )
}
