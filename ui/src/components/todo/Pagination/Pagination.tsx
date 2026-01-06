import { Button } from '../../common'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true
    if (Math.abs(page - currentPage) <= 1) return true
    return false
  })

  const pagesWithGaps: (number | 'gap')[] = []
  visiblePages.forEach((page, index) => {
    if (index > 0 && visiblePages[index - 1] !== page - 1) {
      pagesWithGaps.push('gap')
    }
    pagesWithGaps.push(page)
  })

  return (
    <div className={styles.pagination}>
      <Button
        variant="secondary"
        size="small"
        disabled={currentPage === 1}
        onClick={() => { onPageChange(currentPage - 1) }}
      >
        Poprzednia
      </Button>

      <div className={styles.pages}>
        {pagesWithGaps.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className={styles.gap}>...</span>
          ) : (
            <button
              key={page}
              type="button"
              className={`${styles.page} ${page === currentPage ? styles.active : ''}`}
              onClick={() => { onPageChange(page) }}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <Button
        variant="secondary"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => { onPageChange(currentPage + 1) }}
      >
        Następna
      </Button>
    </div>
  )
}
