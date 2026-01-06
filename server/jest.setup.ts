import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const env = {
  ...process.env,
  DATABASE_URL: 'file:./prisma/test.db',
};

process.env = env;

const testDbPath = path.join('prisma', 'test.db');

try {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
} catch {
  process.exit(1);
}

// Uruchom migracje (stworzy bazę jeśli nie istnieje)
execSync('npx prisma migrate deploy', {
  env,
  stdio: 'pipe',
});

// Paczki ESM Only (Jest nie obsluguje). Konieczne jest zmockowanie zaleznosci.
jest.mock(
  'file-type',
  () => ({
    fileTypeFromBuffer: async () => ({ ext: 'jpg', mime: 'image/jpeg' }),
  }),
  { virtual: true },
);

jest.mock('latinize', () => {
  return jest.fn((str) => str);
});
