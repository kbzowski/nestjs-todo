import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileUploadInterceptor } from './interceptors';
import type { Image } from '../generated/prisma-client/client';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Wgrywa plik obrazu
   * POST /image/upload
   */
  @Post()
  @UseInterceptors(FileUploadInterceptor('file', 5))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<Image> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.imageService.uploadImage(file);
  }
}
