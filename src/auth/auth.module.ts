import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Potrzebny dla PrismaService w RefreshTokenService
    UsersModule, // Potrzebny dla UsersService
    JwtModule.register({}), // Pusta konfiguracja - używamy ConfigService w JwtAuthService
  ],
  controllers: [AuthController],
  providers: [
    HashService,
    JwtAuthService,
    RefreshTokenService, // Zarządzanie refresh tokenami w dedykowanej tabeli
    BasicAuthGuard,
    JwtAuthGuard,
  ],
  exports: [
    HashService, // Eksportuj dla UsersModule
    JwtAuthService,
    RefreshTokenService,
    BasicAuthGuard,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
