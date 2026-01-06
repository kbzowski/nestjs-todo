import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * TESTY E2E API - testowanie endpointów HTTP
 */
describe('API E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Pobiera cookie z odpowiedzi
  const extractCookie = (res: request.Response, name: string): string => {
    const cookies = res.headers['set-cookie'] as string[];
    const cookie = cookies?.find((c) => c.startsWith(`${name}=`));
    return cookie?.split(';')[0] || '';
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Konfiguracja taka sama jak w main.ts!
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());

    await app.init();

    prisma = app.get(PrismaService);
  });

  // Czyścimy bazę przed każdym testem
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  // REJESTRACJA - publiczny endpoint
  describe('POST /api/auth/register', () => {
    it('creates user and returns 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123',
        })
        .expect(201);

      // Sprawdzamy strukturę odpowiedzi
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: 'test@example.com',
      });

      // Hasło NIE powinno być w odpowiedzi!
      expect(response.body.password).toBeUndefined();
    });

    it('returns 409 for duplicate email', async () => {
      // Pierwsza rejestracja
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123' })
        .expect(201);

      // Druga rejestracja z tym samym emailem
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Password123' })
        .expect(409);
    });
  });

  // WALIDACJA - sprawdzanie ValidationPipe
  describe('Validation', () => {
    it('returns 400 with validation errors for invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: '123', // za krótkie
        })
        .expect(400);

      // Sprawdzamy że błędy walidacji są zwracane
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/email/i)]),
      );
    });
  });

  // AUTORYZACJA - chronione endpointy
  describe('Protected endpoints', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/todo').expect(401);
    });

    it('returns 401 for /api/auth/me without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  // PEŁNY FLOW - rejestracja → logowanie → CRUD
  describe('Authenticated flow', () => {
    const testUser = {
      email: 'flow@example.com',
      password: 'TestPassword123',
    };
    let authCookie: string;

    beforeEach(async () => {
      // Zarejestruj użytkownika
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);

      // Zaloguj się (Basic Auth)
      const credentials = Buffer.from(
        `${testUser.email}:${testUser.password}`,
      ).toString('base64');

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Authorization', `Basic ${credentials}`)
        .expect(200);

      // Zapisz cookie do kolejnych requestów
      authCookie = extractCookie(loginResponse, 'access_token');
    });

    it('GET /api/auth/me returns current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('POST /api/todo creates todo', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/todo')
        .set('Cookie', authCookie)
        .send({ title: 'Nowe zadanie' })
        .expect(201);

      expect(response.body.title).toBe('Nowe zadanie');
      expect(response.body.id).toBeDefined();
    });

    it('GET /api/todo/:id returns todo', async () => {
      // Utwórz todo
      const createResponse = await request(app.getHttpServer())
        .post('/api/todo')
        .set('Cookie', authCookie)
        .send({ title: 'Do pobrania' });

      const todoId = createResponse.body.id;

      // Pobierz todo
      const response = await request(app.getHttpServer())
        .get(`/api/todo/${todoId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.title).toBe('Do pobrania');
    });

    it('DELETE /api/todo/:id returns 204', async () => {
      // Utwórz todo
      const createResponse = await request(app.getHttpServer())
        .post('/api/todo')
        .set('Cookie', authCookie)
        .send({ title: 'Do usunięcia' });

      const todoId = createResponse.body.id;

      // Usuń todo
      await request(app.getHttpServer())
        .delete(`/api/todo/${todoId}`)
        .set('Cookie', authCookie)
        .expect(204);

      // Sprawdź że nie istnieje
      await request(app.getHttpServer())
        .get(`/api/todo/${todoId}`)
        .set('Cookie', authCookie)
        .expect(404);
    });
  });
});
