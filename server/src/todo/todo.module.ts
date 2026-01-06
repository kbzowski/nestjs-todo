import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageModule } from '../image/image.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, ImageModule, AuthModule], // AuthModule dla JwtAuthGuard
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
