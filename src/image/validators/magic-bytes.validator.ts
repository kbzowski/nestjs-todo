import { FileValidator } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export interface MagicBytesValidatorOptions {
  /**
   * Dozwolone typy MIME
   */
  allowedMimeTypes: readonly string[];
}

/**
 * Walidator sprawdzający rzeczywisty typ pliku na podstawie magic bytes
 * (nie opiera się na rozszerzeniu pliku ani nagłówkach HTTP)
 */
export class MagicBytesValidator extends FileValidator<MagicBytesValidatorOptions> {
  constructor(options: MagicBytesValidatorOptions) {
    super(options);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file?.buffer) {
      return false;
    }

    const fileType = await fileTypeFromBuffer(file.buffer);

    if (!fileType) {
      return false;
    }

    return this.validationOptions.allowedMimeTypes.includes(fileType.mime);
  }

  buildErrorMessage(): string {
    return `Invalid file type. Allowed types: ${this.validationOptions.allowedMimeTypes.join(', ')}`;
  }
}
