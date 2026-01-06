import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthService } from './services/jwt-auth.service';
import { HashService } from './services/hash.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Endpoint rejestracji (POST /auth/register)
   * Publiczny endpoint - nie wymaga uwierzytelnienia
   * Tworzy nowego użytkownika i zwraca jego dane (bez hasła)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    // Zahashuj hasło przed zapisem do bazy
    const hashedPassword = await this.hashService.hash(createUserDto.password);

    // Utwórz użytkownika
    const user = await this.usersService.create(createUserDto, hashedPassword);

    // Zwróć dane użytkownika (bez hasła - dzięki ClassSerializerInterceptor)
    return new UserResponseDto(user);
  }

  /**
   * Endpoint logowania (POST /auth/login)
   * Wymaga HTTP Basic Auth (Authorization: Basic base64(email:password))
   * Zwraca JWT access token jako httpOnly cookie
   */
  @Post('login')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // BasicAuthGuard ustawił req.user
    const userId = req.user!.userId;

    // Wygeneruj JWT access token
    const accessToken = await this.jwtAuthService.generateAccessToken(userId);

    // Ustaw cookie z odpowiednimi flagami bezpieczeństwa
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true, // Brak dostępu z JavaScript (ochrona przed XSS)
      secure: isProduction, // Tylko HTTPS w produkcji
      sameSite: 'strict', // Ochrona przed CSRF
      maxAge: 60 * 60 * 1000, // 1 godzina (w milisekundach)
      path: '/',
    });

    return {
      message: 'Logged in successfully',
    };
  }

  /**
   * Endpoint wylogowania (POST /auth/logout)
   * Wymaga JWT auth, czyści cookie
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Wyczyść cookie (ustaw maxAge na 0)
    res.cookie('access_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<UserResponseDto> {
    const userId = req.user!.userId;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }
}
