import { useState, useCallback } from 'react'
import { imageApi } from '../api'
import type { Image } from '../types'

export function useImages() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(async (file: File): Promise<Image | null> => {
    setIsUploading(true)
    setError(null)
    try {
      const image = await imageApi.upload(file)
      return image
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd przesyłania obrazu')
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const deleteImage = useCallback(async (id: number): Promise<boolean> => {
    try {
      await imageApi.delete(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd usuwania obrazu')
      return false
    }
  }, [])

  const getImageUrl = useCallback((id: number): string => {
    return imageApi.getUrl(id)
  }, [])

  return {
    isUploading,
    error,
    uploadImage,
    deleteImage,
    getImageUrl,
    clearError: () => { setError(null) },
  }
}
