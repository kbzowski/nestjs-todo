import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '../../common'
import { useAuth } from '../../../hooks'
import { registerSchema } from '../../../schemas'
import { getErrorMessage, getFieldError } from '../../../utils'
import styles from './RegisterForm.module.css'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: ({ value }) => {
      setError(null)
      register(value)
        .then(() => login(value))
        .then(() => {
          void navigate('/todos', { replace: true })
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
      {error && <div className={styles.error} data-testid="register-error">{error}</div>}

      <form.Field
        name="email"
        validators={{ onChange: registerSchema.shape.email }}
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
            data-testid="register-email"
            fullWidth
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: registerSchema.shape.password }}
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
            data-testid="register-password"
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
            data-testid="register-submit"
            fullWidth
          >
            Zarejestruj się
          </Button>
        )}
      </form.Subscribe>

      <p className={styles.link}>
        Masz już konto? <Link to="/login" data-testid="register-login-link">Zaloguj się</Link>
      </p>
    </form>
  )
}
