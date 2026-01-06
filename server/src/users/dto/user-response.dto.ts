import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  email: string;

  @Exclude() // Nigdy nie zwracaj hasła w response
  password: string;

  @Exclude() // Nie zwracaj refresh tokena
  refreshToken: string | null;

  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
