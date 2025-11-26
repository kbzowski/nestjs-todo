import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Prisma } from '../generated/prisma-client/client';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(private prisma: PrismaService) {}

  create(createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: createTodoDto,
    });
  }

  async findAll(queryDto: QueryTodoDto) {
    this.logger.log(queryDto);

    const { search, page, limit, sortBy, sortOrder } = queryDto;

    const skip = (page - 1) * limit;

    // Tworzymy zapytanie WHERE jesli search jest podany
    const where: Prisma.TodoWhereInput = search
      ? { title: { contains: search } }
      : {};

    // Zliczamy rekordy
    const total = await this.prisma.todo.count({ where });

    // Pobieramy dane
    const todos = await this.prisma.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

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

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    await this.findOne(id);

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
