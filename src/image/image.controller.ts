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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ImageUploadPipe } from './pipes';
import { createReadStream } from 'fs';
import type { Image } from '../generated/prisma-client/client';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Wgrywa plik obrazu
   * POST /image
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(ImageUploadPipe) file: Express.Multer.File,
  ): Promise<Image> {
    return this.imageService.uploadImage(file);
  }

  /**
   * Pobiera plik obrazu
   * GET /image/:id
   */
  @Get(':id')
  async getImage(@Param('id', ParseIntPipe) id: number) {
    const imagePath = await this.imageService.getImagePath(id);
    const fileStream = createReadStream(imagePath);

    return new StreamableFile(fileStream, {
      type: 'image/png',
    });
  }

  /**
   * Usuwa obraz
   * DELETE /image/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteImage(@Param('id', ParseIntPipe) id: number) {
    await this.imageService.deleteImage(id);
  }
}
