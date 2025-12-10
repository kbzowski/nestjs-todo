import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

/**
 * Serwis odpowiedzialny za hashowanie i weryfikację haseł
 * Używa argon2 - algorytmu uznawanego za najbezpieczniejszy do hashowania haseł
 */
@Injectable()
export class HashService {
  /**
   * Hashuje hasło używając argon2
   * @param plainText - hasło w formie tekstowej
   * @returns zahashowane hasło
   */
  async hash(plainText: string): Promise<string> {
    return argon2.hash(plainText);
  }

  /**
   * Weryfikuje czy podane hasło pasuje do hasha
   * @param hash - zahashowane hasło
   * @param plainText - hasło w formie tekstowej do weryfikacji
   * @returns true jeśli hasło jest poprawne, false w przeciwnym razie
   */
  async verify(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      // W przypadku błędu (np. nieprawidłowy format hasha) zwróć false
      return false;
    }
  }
}
