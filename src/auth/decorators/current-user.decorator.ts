import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Dekorator do pobierania zalogowanego użytkownika z request
 * Użycie: @CurrentUser() user: Express.RequestUser
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Express.RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
