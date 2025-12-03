import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import latinize from 'latinize';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Image } from '../generated/prisma-client/client';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly uploadDir = 'upload';
  private readonly maxWidth = 800;
  private readonly maxHeight = 600;

  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDir().catch((error) => {
      this.logger.error('Failed to create upload directory', error);
      throw error;
    });
  }

  /**
   * Wgrywa plik obrazu, przetwarza i zapisuje metadane do bazy danych
   */
  async uploadImage(file: Express.Multer.File): Promise<Image> {
    // Generowanie unikalnej nazwy pliku
    const filename = this.generateFilename(file.originalname);
    const filepath = path.join(this.uploadDir, filename);

    // Przetwarzanie obrazu: zmniejszenie rozmiaru i konwersja do PNG
    const processedBuffer = await this.processImage(file.buffer);
    const fileSize = processedBuffer.length;

    // Zapis pliku na dysk
    await fs.writeFile(filepath, processedBuffer);

    // Zapis metadanych do bazy danych
    const image = await this.prisma.image.create({
      data: {
        filename,
        originalName: file.originalname,
        size: fileSize,
      },
    });

    return image;
  }

  /**
   * Usuwa obraz z bazy danych i dysku
   */
  async deleteImage(imageId: number): Promise<void> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Usunięcie pliku z dysku
    const filepath = path.join(this.uploadDir, image.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file from disk: ${image.filename}`,
        error,
      );
    }

    // Usunięcie metadanych z bazy danych
    await this.prisma.image.delete({
      where: { id: imageId },
    });
  }

  /**
   * Zwraca ścieżkę do pliku obrazu
   */
  async getImagePath(imageId: number): Promise<string> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    const filepath = path.join(this.uploadDir, image.filename);

    // Weryfikacja czy plik istnieje
    try {
      await fs.access(filepath);
    } catch {
      throw new NotFoundException(
        `Image file not found on disk: ${image.filename}`,
      );
    }

    return filepath;
  }

  /**
   * Generuje unikalną nazwę pliku: timestamp-zsanityzowana-nazwa-oryginalna.png
   */
  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const sanitized = this.sanitizeFilename(originalName);
    const nameWithoutExt = path.parse(sanitized).name;
    return `${timestamp}-${nameWithoutExt}.png`;
  }

  /**
   * Sanityzuje nazwę pliku poprzez latynizację i usunięcie niebezpiecznych znaków
   */
  private sanitizeFilename(filename: string): string {
    // Latynizacja w celu usunięcia obcych znaków (ą, ć, ę, itp.)
    const latinized = latinize(filename);

    // Usunięcie niebezpiecznych znaków, pozostawienie tylko alfanumerycznych, myślnika, podkreślenia i kropki
    const sanitized = latinized
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return sanitized || 'image';
  }

  /**
   * Przetwarza obraz: zmniejsza do maksymalnych wymiarów i konwertuje do PNG
   */
  private async processImage(buffer: Buffer): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Walidacja metadanych obrazu
    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Unable to read image dimensions');
    }

    // Zmniejszenie tylko jeśli obraz jest większy niż maksymalne wymiary
    if (metadata.width > this.maxWidth || metadata.height > this.maxHeight) {
      return await image
        .resize(this.maxWidth, this.maxHeight, {
          fit: 'inside', // Zachowanie proporcji, bez powiększania
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();
    }

    // Konwersja do PNG bez zmiany rozmiaru
    return await image.png().toBuffer();
  }

  /**
   * Zapewnia istnienie katalogu do wgrywania plików
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory created: ${this.uploadDir}`);
    }
  }
}
