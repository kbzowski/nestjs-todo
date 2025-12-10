import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export interface JwtPayload {
  sub: number;
  exp?: number;
}

/**
 * Generowanie i weryfikacja JWT
 */
@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generuje access token (krótkotrwały)
   * @param userId - ID użytkownika
   * @returns JWT access token
   */
  async generateAccessToken(userId: number): Promise<string> {
    const payload = { sub: userId };
    const secret = this.configService.get<string>('JWT_SECRET')!;
    const expiresIn = this.configService.get<StringValue>(
      'JWT_ACCESS_EXPIRATION',
      '15m',
    );

    const options: JwtSignOptions = {
      secret,
      expiresIn,
    };

    return this.jwtService.signAsync(payload, options);
  }

  /**
   * Weryfikuje i dekoduje access token
   * @param token - JWT access token
   * @returns Payload z tokena
   * @throws UnauthorizedException jeśli token jest nieprawidłowy
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
