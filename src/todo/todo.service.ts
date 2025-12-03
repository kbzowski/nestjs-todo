import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Prisma } from '../generated/prisma-client/client';
import { ImageService } from '../image/image.service';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    const { imageId, ...todoData } = createTodoDto;

    // Weryfikacja czy obraz istnieje jeśli podano imageId
    if (imageId) {
      await this.imageService.findById(imageId);
    }

    return this.prisma.todo.create({
      data: {
        ...todoData,
        imageId,
      },
      include: { image: true },
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

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  // Zwraca liczbę todo używających danego obrazu
  async countTodosUsingImage(imageId: number) {
    return this.prisma.todo.count({
      where: {
        imageId,
      },
    });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);

    // Sprawdzenie czy pole imageId zostało podane w requeście
    const hasImageIdField = updateTodoDto.imageId !== undefined;

    // Weryfikacja czy nowy obraz istnieje, jeśli został podany
    if (hasImageIdField) {
      await this.imageService.findById(updateTodoDto.imageId!);
    }

    // Przygotowanie danych do aktualizacji
    const updateData: Prisma.TodoUpdateInput = {};

    // Dodanie title tylko jeśli został podany
    if (updateTodoDto.title) {
      updateData.title = updateTodoDto.title;
    }

    // Obsługa relacji image (tylko jeśli pole zostało podane w żądaniu)
    if (hasImageIdField) {
      if (updateTodoDto.imageId === null) {
        // Odłączenie obrazu (ustawienie na null)
        updateData.image = { disconnect: true };
      } else {
        // Połączenie z nowym obrazem
        updateData.image = { connect: { id: updateTodoDto.imageId } };
      }

      // Usuń stary obraz TYLKO jeśli:
      // 1. Todo miało wcześniej obraz
      // 2. ImageId się zmienia
      // 3. Żadne inne todo nie używa starego obrazu (zostanie tylko 1 - obecne todo)
      if (todo.imageId && todo.imageId !== updateTodoDto.imageId) {
        const othersCount = await this.countTodosUsingImage(todo.imageId);

        if (othersCount === 1) {
          await this.imageService.deleteImage(todo.imageId);
        }
      }
    }

    // Aktualizacja todo w bazie danych
    return this.prisma.todo.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });
  }

  async remove(id: number) {
    const todo = await this.findOne(id);

    // Najpierw usuń todo
    await this.prisma.todo.delete({
      where: { id },
    });

    // Usuń powiązany obraz jesli jest osierocony
    if (!todo.imageId) return;

    const othersCount = await this.countTodosUsingImage(todo.imageId);
    if (othersCount === 0) {
      await this.imageService.deleteImage(todo.imageId);
    }
  }
}
