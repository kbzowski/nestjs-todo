import { apiClient } from './client'
import type { Image } from '../types'

export const imageApi = {
  upload: (file: File): Promise<Image> =>
    apiClient.uploadFile('/image', file),

  getUrl: (id: number): string =>
    `/api/image/${id}`,

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/image/${id}`),
}
