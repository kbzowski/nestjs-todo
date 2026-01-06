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
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ParsePositiveIntPipe } from '../common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Wszystkie endpointy Todo są chronione JWT guardem
 * Każdy użytkownik widzi tylko swoje todo
 */
@Controller('todo')
@UseGuards(JwtAuthGuard) // Zabezpiecz wszystkie endpointy w tym kontrolerze
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: Express.RequestUser,
  ) {
    return this.todoService.create(createTodoDto, user.userId);
  }

  @Get()
  findAll(
    @Query() queryDto: QueryTodoDto,
    @CurrentUser() user: Express.RequestUser,
  ) {
    return this.todoService.findAll(queryDto, user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParsePositiveIntPipe) id: number,
    @CurrentUser() user: Express.RequestUser,
  ) {
    return this.todoService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: Express.RequestUser,
  ) {
    return this.todoService.update(id, updateTodoDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', ParsePositiveIntPipe) id: number,
    @CurrentUser() user: Express.RequestUser,
  ) {
    await this.todoService.remove(id, user.userId);
  }
}
