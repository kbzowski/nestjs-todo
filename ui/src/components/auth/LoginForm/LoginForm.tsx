import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../common'
import { useAuth } from '../../../hooks'
import { loginSchema } from '../../../schemas'
import { getErrorMessage, getFieldError } from '../../../utils'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: ({ value }) => {
      setError(null)
      login(value)
        .then(() => {
          void navigate('/todos')
        })
        .catch((err: unknown) => {
          setError(getErrorMessage(err))
        })
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
      {error && <div className={styles.error} data-testid="login-error">{error}</div>}

      <form.Field
        name="email"
        validators={{ onChange: loginSchema.shape.email }}
      >
        {(field) => (
          <Input
            label="Email"
            type="email"
            name={field.name}
            value={field.state.value}
            onChange={(e) => { field.handleChange(e.target.value) }}
            onBlur={field.handleBlur}
            error={getFieldError(field.state.meta.errors)}
            data-testid="login-email"
            fullWidth
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: loginSchema.shape.password }}
      >
        {(field) => (
          <Input
            label="Hasło"
            type="password"
            name={field.name}
            value={field.state.value}
            onChange={(e) => { field.handleChange(e.target.value) }}
            onBlur={field.handleBlur}
            error={getFieldError(field.state.meta.errors)}
            data-testid="login-password"
            fullWidth
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            data-testid="login-submit"
            fullWidth
          >
            Zaloguj się
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
