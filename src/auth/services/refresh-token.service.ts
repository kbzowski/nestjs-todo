import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HashService } from './hash.service';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

const randomBytesAsync = promisify(randomBytes);

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  /**
   * Tworzy nowy refresh token dla użytkownika
   *
   * @param userId - ID użytkownika
   * @param expiresAt - Data wygaśnięcia tokena
   * @returns Wygenerowany token (plain text) do wysłania w cookie
   */
  async createRefreshToken(userId: number, expiresAt: Date): Promise<string> {
    // Wygeneruj kryptograficznie bezpieczny opaque token
    const token = await this.generateOpaqueToken();

    // Zahashuj token przed zapisem do bazy (argon2)
    const tokenHash = await this.hashService.hash(token);

    // Zapisz hash tokena w bazie
    await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Weryfikuje refresh token i zwraca userId jeśli prawidłowy
   *
   * @param token - Plain text token z cookie
   * @returns userId jeśli token prawidłowy
   * @throws UnauthorizedException jeśli token nieprawidłowy lub wygasły
   */
  async verifyRefreshToken(token: string): Promise<number> {
    // Pobierz wszystkie niewygasłe tokeny z bazy
    const validTokens = await this.prisma.refreshToken.findMany({
      where: {
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    // Sprawdź każdy token (porównaj hash)
    for (const dbToken of validTokens) {
      const isValid = await this.hashService.verify(dbToken.token, token);

      if (isValid) {
        return dbToken.userId;
      }
    }

    // Żaden token nie pasuje
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  /**
   * Usuwa wszystkie refresh token użytkownika (wylogowanie)
   *
   * @param userId - ID użytkownika
   */
  async deleteUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Usuwa wygasłe tokeny
   * Można wywołać periodycznie
   */
  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Mniejsze od obecnej daty
        },
      },
    });
  }

  /**
   * Generuje kryptograficznie bezpieczny opaque token
   *
   * @param bytes - liczba bajtów losowości (domyślnie 32 = 256 bitów)
   * @returns base64url-encoded token (~43 znaki dla 32 bajtów)
   */
  private async generateOpaqueToken(bytes: number = 32): Promise<string> {
    const buffer = await randomBytesAsync(bytes);

    // Konwertuj na base64url (RFC 4648 §5)
    return buffer.toString('base64');
  }
}
