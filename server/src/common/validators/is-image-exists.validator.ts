import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Walidator sprawdzający czy obraz o podanym ID istnieje w bazie danych
 */
@ValidatorConstraint({ name: 'isImageExists', async: true })
@Injectable()
export class IsImageExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(imageId: number | null | undefined): Promise<boolean> {
    // null i undefined są dozwolone (opcjonalne pole)
    if (imageId === null || imageId === undefined) {
      return true;
    }

    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    return !!image;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Image with ID ${args.value} does not exist`;
  }
}

/**
 * Dekorator sprawdzający czy obraz istnieje
 * Użycie: @IsImageExists() imageId?: number;
 */
export function IsImageExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsImageExistsConstraint,
    });
  };
}
