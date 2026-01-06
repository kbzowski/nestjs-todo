import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Input } from '../../common'
import { ImageUpload } from '../ImageUpload'
import { todoSchema } from '../../../schemas'
import { getFieldError } from '../../../utils'
import type { Todo, CreateTodoData } from '../../../types'
import styles from './TodoForm.module.css'

interface TodoFormProps {
  initialData?: Todo
  onSubmit: (data: CreateTodoData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function TodoForm({ initialData, onSubmit, onCancel, isSubmitting = false }: TodoFormProps) {
  const [imageId, setImageId] = useState<number | undefined>(initialData?.imageId ?? undefined)

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        title: value.title,
        imageId,
      })
      if (!initialData) {
        form.reset()
        setImageId(undefined)
      }
    },
  })

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="title"
        validators={{ onChange: todoSchema.shape.title }}
      >
        {(field) => (
          <Input
            label="Tytuł"
            name={field.name}
            value={field.state.value}
            onChange={(e) => { field.handleChange(e.target.value) }}
            onBlur={field.handleBlur}
            error={getFieldError(field.state.meta.errors)}
            data-testid="todo-title"
            fullWidth
          />
        )}
      </form.Field>

      <ImageUpload
        label="Obraz (opcjonalnie)"
        value={imageId}
        onChange={setImageId}
      />

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Anuluj
          </Button>
        )}
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting} data-testid="todo-submit">
              {initialData ? 'Zapisz zmiany' : 'Dodaj zadanie'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
