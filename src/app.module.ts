import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [PrismaModule, TodoModule, ImageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
