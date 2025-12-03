import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

/**
 * Własny interceptor do wgrywania plików z pamięcią tymczasową
 * Obsługuje wgrywanie plików z limitami rozmiaru i przechowywaniem w pamięci
 */
export function FileUploadInterceptor(
  fieldName: string = 'file',
  maxSizeInMb: number = 5,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;

    constructor() {
      const multerOptions: MulterOptions = {
        storage: memoryStorage(),
        limits: {
          fileSize: maxSizeInMb * 1024 * 1024, // Konwersja MB na bajty
        },
      };

      this.fileInterceptor = new (FileInterceptor(fieldName, multerOptions))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }

  return mixin(Interceptor);
}
