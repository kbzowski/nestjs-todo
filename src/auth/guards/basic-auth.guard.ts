import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { HashService } from '../services/hash.service';

interface BasicAuthCredentials {
  email: string;
  password: string;
}

/**
 * Guard implementujący HTTP Basic Authentication (RFC 7617)
 * Oczekuje nagłówka: Authorization: Basic base64(email:password)
 */
@Injectable()
export class BasicAuthGuard implements CanActivate {
  private static readonly BASIC_AUTH_PREFIX = 'Basic ';
  private static readonly CREDENTIALS_SEPARATOR = ':';

  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const credentials = this.extractCredentials(request);
    const user = await this.validateCredentials(credentials);

    // Dodaj użytkownika do request (bez hasła!)

    request.user = {
      userId: user.id,
    };

    return true;
  }

  /**
   * Wyciąga i parsuje dane uwierzytelniające z nagłówka Authorization
   */
  private extractCredentials(request: Request): BasicAuthCredentials {
    const authHeader = request.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(BasicAuthGuard.BASIC_AUTH_PREFIX)
    ) {
      throw new UnauthorizedException(
        'Missing Authorization: Basic header. Required: Authorization: Basic base64(email:password)',
      );
    }

    const base64Credentials = authHeader.substring(
      BasicAuthGuard.BASIC_AUTH_PREFIX.length,
    );

    const decodedCredentials = this.decodeBase64(base64Credentials);
    return this.parseCredentials(decodedCredentials);
  }

  /**
   * Dekoduje base64 string
   */
  private decodeBase64(base64String: string): string {
    try {
      return Buffer.from(base64String, 'base64').toString('utf-8');
    } catch {
      throw new UnauthorizedException('Invalid Base64 encoding');
    }
  }

  /**
   * Parsuje string "email:password" na obiekt
   */
  private parseCredentials(credentials: string): BasicAuthCredentials {
    const parts = credentials.split(BasicAuthGuard.CREDENTIALS_SEPARATOR);

    if (parts.length !== 2) {
      throw new UnauthorizedException(
        'Invalid credentials format. Required: email:password',
      );
    }

    const [email, password] = parts;

    if (!email || !password) {
      throw new UnauthorizedException(
        'Invalid credentials format. Email and password cannot be empty',
      );
    }

    return { email, password };
  }

  /**
   * Waliduje credentials użytkownika
   * Zwraca użytkownika jeśli credentials prawidłowe
   */
  private async validateCredentials(credentials: BasicAuthCredentials) {
    const { email, password } = credentials;

    // Znajdź użytkownika po emailu
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Weryfikuj hasło używając argon2
    const isPasswordValid = await this.hashService.verify(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}
