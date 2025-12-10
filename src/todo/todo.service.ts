import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Prisma } from '../generated/prisma-client/client';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Tworzy nowe todo dla danego użytkownika
   */
  async create(createTodoDto: CreateTodoDto, userId: number) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId, // Dodaj userId z zalogowanego użytkownika
      },
      include: { image: true },
    });
  }

  /**
   * Zwraca wszystkie todo należące do danego użytkownika
   */
  async findAll(queryDto: QueryTodoDto, userId: number) {
    this.logger.log(queryDto);

    const { search, page, limit, sortBy, sortOrder } = queryDto;

    const skip = (page - 1) * limit;

    // Tworzymy zapytanie WHERE - zawsze filtruj po userId!
    const where: Prisma.TodoWhereInput = {
      userId, // WAŻNE: Użytkownik widzi tylko swoje todo
      ...(search && { title: { contains: search } }),
    };

    // Zliczamy rekordy
    const totalPromise = this.prisma.todo.count({ where });

    // Pobieramy dane
    const todosPromise = this.prisma.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: { image: true },
    });

    const [total, todos] = await Promise.all([totalPromise, todosPromise]);

    return {
      data: todos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Znajduje jedno todo - sprawdza czy należy do użytkownika
   */
  async findOne(id: number, userId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Sprawdź czy todo należy do użytkownika
    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }

    return todo;
  }

  /**
   * Aktualizuje todo - tylko właściciel może aktualizować
   */
  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number) {
    // Sprawdź czy todo należy do użytkownika
    await this.findOne(id, userId);

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
      include: { image: true },
    });
  }

  /**
   * Usuwa todo - tylko właściciel może usunąć
   */
  async remove(id: number, userId: number) {
    // Sprawdź czy todo należy do użytkownika
    await this.findOne(id, userId);

    await this.prisma.todo.delete({
      where: { id },
    });
  }
}
