/**
 * Rozszerzenie typów Express Request
 * Dodaje pole user do request (ustawiane przez guardy)
 * Dodaje mocne typowanie dla cookies (z cookie-parser)
 */
declare global {
  namespace Express {
    /**
     * Typ użytkownika w kontekście request
     * Reprezentuje użytkownika po uwierzytelnieniu przez guardy
     */
    interface RequestUser {
      userId: number;
    }

    interface AppCookies {
      access_token?: string;
      refresh_token?: string;
    }

    interface Request {
      user?: RequestUser;

      cookies?: AppCookies & Record<string, string | undefined>;
    }
  }
}

// Export typów do użycia w innych plikach
export type AppCookies = Express.AppCookies;
