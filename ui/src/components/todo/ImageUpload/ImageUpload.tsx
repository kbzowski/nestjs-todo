import { useRef } from 'react'
import { useImages } from '../../../hooks'
import { imageApi } from '../../../api'
import { Button, Spinner } from '../../common'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
  label?: string
  value?: number
  onChange: (imageId: number | undefined) => void
}

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading, error } = useImages()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const image = await uploadImage(file)
    if (image) {
      onChange(image.id)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange(undefined)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { void handleFileChange(e) }}
        className={styles.input}
      />

      {value ? (
        <div className={styles.preview}>
          <img
            src={imageApi.getUrl(value)}
            alt="Podgląd"
            className={styles.image}
          />
          <Button type="button" variant="danger" size="small" onClick={handleRemove}>
            Usuń obraz
          </Button>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={handleClick} disabled={isUploading}>
          {isUploading ? <Spinner size="small" /> : 'Wybierz obraz'}
        </Button>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
