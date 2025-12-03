import {
  Injectable,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { MagicBytesValidator } from '../validators';

/**
 * Pipe do walidacji wgrywanych obrazów
 * Sprawdza rozmiar pliku oraz rzeczywisty typ na podstawie magic bytes
 */
@Injectable()
export class ImageUploadPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
        new MagicBytesValidator({
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
        }),
      ],
    });
  }
}
