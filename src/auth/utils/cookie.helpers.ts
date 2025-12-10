import { Request } from 'express';
import type { AppCookies } from '../types/express';

/**
 * Bezpiecznie wyciąga cookie z request z mocnym typowaniem
 *
 * @param request - Express Request
 * @param cookieName - Nazwa cookie
 * @returns Wartość cookie lub undefined
 */
export function getCookie(
  request: Request,
  cookieName: keyof AppCookies,
): string | undefined {
  const cookies = request.cookies as AppCookies | undefined;
  return cookies?.[cookieName];
}
