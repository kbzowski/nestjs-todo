import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}), // Pusta konfiguracja - używamy ConfigService w JwtAuthService
  ],
  controllers: [AuthController],
  providers: [HashService, JwtAuthService, BasicAuthGuard, JwtAuthGuard],
  exports: [HashService, JwtAuthService, BasicAuthGuard, JwtAuthGuard],
})
export class AuthModule {}
