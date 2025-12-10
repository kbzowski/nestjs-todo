import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../generated/prisma-client/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tworzy nowego użytkownika
   * UWAGA: Hasło powinno być zahashowane PRZED wywołaniem tej metody
   */
  async create(
    createUserDto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Utwórz użytkownika z zahashowanym hasłem
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  /**
   * Znajduje użytkownika po emailu
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Znajduje użytkownika po ID
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
