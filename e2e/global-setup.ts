import { execSync } from 'child_process'
import path from 'path'

function globalSetup() {
  const serverDir = path.resolve(__dirname, '../server')

  console.log('Przygotowuję bazę danych...')

  const env = {
    ...process.env,
    DATABASE_URL: 'file:./prisma/test.db',
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes',
  }

  try {
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      cwd: serverDir,
      env,
      stdio: 'pipe',
    })
    console.log('Baza danych gotowa!')
  } catch (err) {
    console.log('Błąd migracji:', err)
    throw err
  }
}

export default globalSetup
