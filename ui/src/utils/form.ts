/**
 * Wyciąga pierwszy błąd walidacji z pola formularza TanStack Form.
 * TanStack Form może zwracać błędy jako string lub jako obiekt ValidationError.
 */
export function getFieldError(errors: unknown[] | undefined): string | undefined {
  if (!errors || errors.length === 0) {
    return undefined
  }

  const firstError = errors[0]

  if (typeof firstError === 'string') {
    return firstError
  }

  // Zod ValidationError ma pole 'message'
  if (firstError && typeof firstError === 'object' && 'message' in firstError) {
    return String(firstError.message)
  }

  return undefined
}
