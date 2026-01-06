import { useState, useEffect } from 'react'
import { Input, Button } from '../../common'
import type { TodoQueryParams } from '../../../types'
import styles from './TodoFilters.module.css'

interface TodoFiltersProps {
  initialParams?: TodoQueryParams
  onFilter: (params: TodoQueryParams) => void
}

export function TodoFilters({ initialParams, onFilter }: TodoFiltersProps) {
  const [search, setSearch] = useState(initialParams?.search ?? '')
  const [sortBy, setSortBy] = useState<'id' | 'title'>(initialParams?.sortBy ?? 'id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialParams?.sortOrder ?? 'desc')

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({
        search: search || undefined,
        sortBy,
        sortOrder,
        page: 1,
      })
    }, 300)

    return () => { clearTimeout(timer) }
  }, [search, sortBy, sortOrder, onFilter])

  const handleReset = () => {
    setSearch('')
    setSortBy('id')
    setSortOrder('desc')
  }

  return (
    <div className={styles.filters}>
      <Input
        placeholder="Szukaj..."
        value={search}
        onChange={(e) => { setSearch(e.target.value) }}
        className={styles.search}
        data-testid="todo-search"
      />

      <select
        value={sortBy}
        onChange={(e) => { setSortBy(e.target.value as 'id' | 'title') }}
        className={styles.select}
      >
        <option value="id">Sortuj wg ID</option>
        <option value="title">Sortuj wg tytułu</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc') }}
        className={styles.select}
      >
        <option value="desc">Malejąco</option>
        <option value="asc">Rosnąco</option>
      </select>

      <Button type="button" variant="secondary" size="small" onClick={handleReset} data-testid="todo-reset-filters">
        Resetuj
      </Button>
    </div>
  )
}
