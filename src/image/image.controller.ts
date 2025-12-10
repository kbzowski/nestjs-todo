import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseIntPipe,
  HttpCode,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import mime from 'mime-types';
import { ImageService } from './image.service';
import { ImageUploadPipe } from './pipes';
import { createReadStream } from 'fs';
import type { Image } from '../generated/prisma-client/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Wgrywa plik
   */
  @Post()
  @UseGuards(JwtAuthGuard) // Tylko zalogowani mogą uploadować
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(ImageUploadPipe) file: Express.Multer.File,
    @CurrentUser() user: Express.RequestUser,
  ): Promise<Image> {
    return this.imageService.uploadImage(file, user.userId);
  }

  /**
   * Pobiera plik obrazu
   */
  @Get(':id')
  async getImage(@Param('id', ParseIntPipe) id: number) {
    const imagePath = await this.imageService.getImagePath(id);
    const fileStream = createReadStream(imagePath);

    return new StreamableFile(fileStream, {
      type: mime.types.png,
    });
  }

  /**
   * Usuwa obraz
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Tylko zalogowani mogą usuwać
  @HttpCode(204)
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.RequestUser,
  ) {
    await this.imageService.deleteImage(id, user.userId);
  }
}
