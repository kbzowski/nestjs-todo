import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthService } from './services/jwt-auth.service';
import { HashService } from './services/hash.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { getCookie } from './utils/cookie.helpers';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly refreshTokenExpirationDays: number;

  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly hashService: HashService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpirationDays = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_DAYS', '7'),
      10,
    );
  }

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
   * Zwraca JWT access token + opaque refresh token jako httpOnly cookies
   */
  @Post('login')
  @UseGuards(BasicAuthGuard) // BasicAuthGuard weryfikuje dane logowania
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // BasicAuthGuard ustawił req.user
    const userId = req.user!.userId;

    // Wygeneruj JWT access token (krótkotrwały)
    const accessToken = await this.jwtAuthService.generateAccessToken(userId);

    // Oblicz czas wygaśnięcia refresh tokena
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + this.refreshTokenExpirationDays,
    );

    // Wygeneruj i zapisz opaque refresh token w dedykowanej tabeli
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      userId,
      refreshTokenExpiresAt,
    );

    // Ustaw cookies z odpowiednimi flagami bezpieczeństwa
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Access token cookie (krótkotrwały, np. 15m)
    res.cookie('access_token', accessToken, {
      httpOnly: true, // Brak dostępu z JavaScript (ochrona przed XSS)
      secure: isProduction, // Tylko HTTPS w produkcji
      sameSite: 'strict', // Ochrona przed CSRF
      maxAge: 15 * 60 * 1000, // 15 minut (w milisekundach)
      path: '/',
    });

    // Refresh token cookie (długotrwały, opaque token)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: this.refreshTokenExpirationDays * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Logged in successfully',
    };
  }

  /**
   * Endpoint odświeżania tokena (POST /auth/refresh)
   * Używa opaque refresh tokena z cookie
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Pobierz refresh token z cookie (mocno typowane przez helper)
    const token = getCookie(req, 'refresh_token');

    if (!token) {
      throw new UnauthorizedException(
        'Refresh token not found. Please login again.',
      );
    }

    // Zweryfikuj refresh token i pobierz userId
    const userId = await this.refreshTokenService.verifyRefreshToken(token);

    // Wygeneruj nowy access token
    const newAccessToken =
      await this.jwtAuthService.generateAccessToken(userId);

    // Refresh Token Rotation - wygeneruj nowy refresh token
    const newRefreshTokenExpiresAt = new Date();
    newRefreshTokenExpiresAt.setDate(
      newRefreshTokenExpiresAt.getDate() + this.refreshTokenExpirationDays,
    );

    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      userId,
      newRefreshTokenExpiresAt,
    );

    // Ustaw nowe cookies
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minut
      path: '/',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: this.refreshTokenExpirationDays * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Token refreshed successfully',
    };
  }

  /**
   * Endpoint wylogowania (POST /auth/logout)
   * Wymaga JWT auth, usuwa refresh tokeny z bazy i czyści cookies
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = req.user!.userId;

    // Usuń wszystkie refresh tokeny użytkownika z bazy danych
    await this.refreshTokenService.deleteUserTokens(userId);

    // Wyczyść cookies (ustaw maxAge na 0)
    res.cookie('access_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
