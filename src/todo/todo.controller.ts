import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  Query,
  ParseIntPipe,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ParsePositiveIntPipe } from '../common';
import { ImageService } from '../image/image.service';
import { createReadStream } from 'fs';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryTodoDto) {
    return this.todoService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    // albo ParseIntPipe
    return this.todoService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.todoService.remove(id);
  }

  @Get(':id/image')
  async getImage(@Param('id', ParseIntPipe) id: number) {
    const todo = await this.todoService.findOne(id);

    if (!todo.image) {
      throw new NotFoundException(`Todo with ID ${id} has no image`);
    }

    const imagePath = await this.imageService.getImagePath(todo.image.id);
    const fileStream = createReadStream(imagePath);

    return new StreamableFile(fileStream, {
      type: 'image/png',
    });
  }
}
