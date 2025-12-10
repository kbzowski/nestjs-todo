import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthService } from '../services/jwt-auth.service';
import { getCookie } from '../utils/cookie.helpers';

/**
 * Guard weryfikujący JWT access token z cookie
 * Oczekuje cookie o nazwie 'access_token'
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Pobierz access token z cookie (mocno typowane przez helper)
    const accessToken = getCookie(request, 'access_token');

    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token not found. Please login again.',
      );
    }

    try {
      // Weryfikuj i dekoduj token
      const payload = await this.jwtAuthService.verifyAccessToken(accessToken);

      // Dodaj informacje o użytkowniku do request
      request.user = {
        userId: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token. Please login again.',
      );
    }
  }
}
