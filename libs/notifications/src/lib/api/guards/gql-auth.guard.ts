/**
 * @fileoverview Guardia de Autenticación GraphQL (Interino)
 * @module Notifications/Security
 * @description
 * Placeholder robusto. En producción, reemplaza la lógica de `validateRequest`
 * con la validación real de tu JWT.
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // LÓGICA DE EXTRACCIÓN DE USUARIO (MOCK/REAL MIX)
    // Buscamos el header Authorization o un mock user en desarrollo
    const authHeader = req.headers.authorization;
    const mockUserId = req.headers['x-mock-user-id']; // Para testing fácil

    if (mockUserId) {
      req.user = { id: mockUserId };
      return true;
    }

    if (!authHeader) {
      // En modo estricto, esto lanza error.
      // throw new UnauthorizedException('Missing Authorization Header');

      // MODO PERMISIVO (Para desarrollo inicial): Asignamos un usuario fantasma
      req.user = { id: '00000000-0000-0000-0000-000000000000' };
      return true;
    }

    // Aquí iría la validación real del JWT
    return true;
  }
}

// Decorador para extraer el usuario de forma limpia en el Resolver
import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
