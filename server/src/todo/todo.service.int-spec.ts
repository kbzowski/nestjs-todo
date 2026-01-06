import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';

/**
 * TESTY INTEGRACYJNE - TodoService
 */
describe('TodoService Integration', () => {
  let service: TodoService;
  let prisma: PrismaService;

  // Helper: tworzy użytkownika testowego
  const createTestUser = (email = 'test@test.pl') =>
    prisma.user.create({
      data: { email, password: 'hashedPassword123' },
    });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Izolacja testów: czyścimy bazę przed każdym testem
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // PODSTAWOWY CRUD - zapis i odczyt z bazy
  describe('Create and Read', () => {
    it('persists todo in database and retrieves it correctly', async () => {
      const user = await createTestUser();

      // Wywołujemy serwis
      const created = await service.create({ title: 'Kup mleko' }, user.id);

      // Weryfikujemy BEZPOŚREDNIO w bazie (nie przez serwis!)
      const fromDb = await prisma.todo.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).not.toBeNull();
      expect(fromDb?.title).toBe('Kup mleko');
      expect(fromDb?.userId).toBe(user.id);
    });
  });

  // RELACJE - testowanie powiązań między tabelami
  describe('Relations', () => {
    it('returns todo with related image when exists', async () => {
      const user = await createTestUser();

      // Tworzymy obraz w bazie
      const image = await prisma.image.create({
        data: {
          filename: `test-${Date.now()}.jpg`, // unikalna nazwa
          originalName: 'zdjecie.jpg',
          size: 1024,
          userId: user.id,
        },
      });

      // Tworzymy todo z obrazem
      const todo = await service.create(
        { title: 'Z obrazkiem', imageId: image.id },
        user.id,
      );

      const fetched = await service.findOne(todo.id, user.id);

      expect(fetched.image).not.toBeNull();
      expect(fetched.image?.id).toBe(image.id);
      expect(fetched.image?.originalName).toBe('zdjecie.jpg');
    });
  });

  // FILTROWANIE - czy zapytania SQL działają poprawnie
  describe('Filtering and Pagination', () => {
    it('filters todos by search term', async () => {
      const user = await createTestUser();

      // Tworzymy kilka todo
      await service.create({ title: 'Kup mleko' }, user.id);
      await service.create({ title: 'Kup chleb' }, user.id);
      await service.create({ title: 'Zadzwoń do mamy' }, user.id);

      // Szukamy "Kup"
      const result = await service.findAll(
        { search: 'Kup', page: 1, limit: 10, sortBy: 'id', sortOrder: 'asc' },
        user.id,
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.every((t) => t.title.includes('Kup'))).toBe(true);
      expect(result.meta.total).toBe(2);
    });
  });

  // IZOLACJA DANYCH - użytkownicy widzą tylko swoje dane
  describe('Data Isolation', () => {
    it('user cannot access another user todos', async () => {
      const alice = await createTestUser('alice@test.pl');
      const bob = await createTestUser('bob@test.pl');

      // Alice tworzy todo
      const aliceTodo = await service.create(
        { title: 'Sekret Alice' },
        alice.id,
      );

      // Bob próbuje je odczytać - powinien dostać ForbiddenException
      await expect(service.findOne(aliceTodo.id, bob.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('findAll returns only todos belonging to the user', async () => {
      const alice = await createTestUser('alice@test.pl');
      const bob = await createTestUser('bob@test.pl');

      await service.create({ title: 'Todo Alice 1' }, alice.id);
      await service.create({ title: 'Todo Alice 2' }, alice.id);
      await service.create({ title: 'Todo Bob' }, bob.id);

      const aliceResult = await service.findAll(
        { page: 1, limit: 10, sortBy: 'id', sortOrder: 'asc' },
        alice.id,
      );

      expect(aliceResult.data).toHaveLength(2);
      expect(aliceResult.data.every((t) => t.userId === alice.id)).toBe(true);
    });
  });

  // USUWANIE
  describe('Delete Operations', () => {
    it('removes todo from database permanently', async () => {
      const user = await createTestUser();
      const todo = await service.create({ title: 'Do usunięcia' }, user.id);

      await service.remove(todo.id, user.id);

      // Sprawdzamy bezpośrednio w bazie
      const fromDb = await prisma.todo.findUnique({ where: { id: todo.id } });
      expect(fromDb).toBeNull();
    });

    it('throws NotFoundException when deleting non-existent todo', async () => {
      const user = await createTestUser();

      await expect(service.remove(99999, user.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
