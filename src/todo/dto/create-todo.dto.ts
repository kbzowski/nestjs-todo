import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsInt,
} from 'class-validator';
import { IsImageExists } from '../../common';

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsOptional()
  @IsImageExists()
  @IsInt({ message: 'Image ID must be an integer' })
  imageId?: number;
}
