// INICIO DEL ARCHIVO [apps/api/src/app/modules/auth/auth.module.ts]
/**
 * @fileoverview Auth Module con Inyección Hexagonal
 * @module API/Auth
 * @description
 * Módulo responsable de la autenticación. Configura los controladores y servicios,
 * y realiza el binding de los puertos del Core a la infraestructura de Drizzle.
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepositoryPort } from '@razworks/core';
import { DrizzleUserRepository } from '@razworks/database';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    // BINDING HEXAGONAL:
    // Cuando el AuthService solicite UserRepositoryPort (Core),
    // NestJS inyectará DrizzleUserRepository (Database Infra).
    {
      provide: UserRepositoryPort,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
// FIN DEL ARCHIVO [apps/api/src/app/modules/auth/auth.module.ts]
