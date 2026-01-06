import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

async function globalSetup() {
  const serverDir = path.resolve(__dirname, '../server')
  const testDbPath = path.join(serverDir, 'prisma', 'test.db')

  console.log('Przygotowuję bazę danych...')

  const env = {
    ...process.env,
    DATABASE_URL: 'file:./prisma/test.db',
  }

  // Spróbuj usunąć bazę testową (jeśli nie jest zablokowana)
  try {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
      console.log('Usunięto istniejącą test.db')
    }
    const journalPath = `${testDbPath}-journal`
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath)
    }
  } catch {
    // Jeśli nie można usunąć, kontynuuj - Prisma ogarnie
    console.log('Nie można usunąć test.db (może być w użyciu) - kontynuuję')
  }

  // Uruchom migracje (stworzy bazę jeśli nie istnieje)
  console.log('Migracja bazy danych...')
  try {
    execSync('npx prisma migrate deploy', {
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
