import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { Todo } from '../generated/prisma-client/client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

/**
 * Testy jednostkowe serwisu TodoService
 *
 * Kluczowe koncepcje:
 * 1. Mockowanie PrismaService (bazy danych)
 * 2. Testowanie logiki biznesowej w izolacji
 * 3. Testowanie wyjątków (NotFoundException, ForbiddenException)
 */

// Mock PrismaService - symulujemy operacje na bazie danych
const mockPrismaService = {
  todo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        // Podmieniamy PrismaService na mock
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);

    // Czyścimy mocki przed każdym testem
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('creates todo with correct userId', async () => {
      const createDto: CreateTodoDto = { title: 'Nowe todo' };
      const userId = 1;
      const expectedTodo: Todo = {
        id: 1,
        title: 'Nowe todo',
        userId: 1,
        imageId: null,
      };

      mockPrismaService.todo.create.mockResolvedValue(expectedTodo);

      const result = await service.create(createDto, userId);

      // Sprawdzamy czy Prisma została wywołana z poprawnymi danymi
      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: { ...createDto, userId },
        include: { image: true },
      });
      expect(result).toEqual(expectedTodo);
    });
  });

  describe('findOne()', () => {
    // Scenariusz 1: Todo istnieje i należy do użytkownika
    it('returns todo when it exists and belongs to user', async () => {
      const todo: Todo = {
        id: 1,
        title: 'Moje todo',
        userId: 1,
        imageId: null,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(todo);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(todo);
    });

    // Scenariusz 2: Todo nie istnieje - rzuca NotFoundException
    it('throws NotFoundException when todo does not exist', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      // Sprawdzamy czy rzuca właściwy wyjątek
      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    // Scenariusz 3: Todo należy do innego użytkownika - rzuca ForbiddenException
    it('throws ForbiddenException when todo belongs to different user', async () => {
      const todo = { id: 1, title: 'Cudze todo', userId: 2, image: null };

      mockPrismaService.todo.findUnique.mockResolvedValue(todo);

      // Użytkownik 1 próbuje dostać todo użytkownika 2
      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll()', () => {
    it('returns paginated results with correct meta', async () => {
      const queryDto: QueryTodoDto = {
        page: 1,
        limit: 10,
        sortBy: 'id' as const,
        sortOrder: 'desc' as const,
      };
      const userId = 1;
      const todos: Todo[] = [
        { id: 1, title: 'Todo 1', userId: 1, imageId: null },
        { id: 2, title: 'Todo 2', userId: 1, imageId: null },
      ];

      mockPrismaService.todo.count.mockResolvedValue(2);
      mockPrismaService.todo.findMany.mockResolvedValue(todos);

      const result = await service.findAll(queryDto, userId);

      // Sprawdzamy strukturę odpowiedzi
      expect(result).toEqual({
        data: todos,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('applies search filter when provided', async () => {
      const queryDto: QueryTodoDto = {
        page: 1,
        limit: 10,
        sortBy: 'id' as const,
        sortOrder: 'desc' as const,
        search: 'zakupy',
      };

      mockPrismaService.todo.count.mockResolvedValue(0);
      mockPrismaService.todo.findMany.mockResolvedValue([]);

      await service.findAll(queryDto, 1);

      // Sprawdzamy czy search jest w where
      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'zakupy' },
          }),
        }),
      );
    });
  });

  describe('remove()', () => {
    it('deletes todo when user is owner', async () => {
      const todo: Todo = {
        id: 1,
        title: 'Do usunięcia',
        userId: 1,
        imageId: null,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(todo);
      mockPrismaService.todo.delete.mockResolvedValue(todo);

      await service.remove(1, 1);

      expect(mockPrismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws ForbiddenException when trying to delete other user todo', async () => {
      const todo: Todo = {
        id: 1,
        title: 'Cudze todo',
        userId: 2,
        imageId: null,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(todo);

      // Użytkownik 1 próbuje usunąć todo użytkownika 2
      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);

      // Sprawdzamy że delete nie został wywołany
      expect(mockPrismaService.todo.delete).not.toHaveBeenCalled();
    });
  });
});
