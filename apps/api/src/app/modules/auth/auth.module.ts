// apps/api/src/app/modules/auth/auth.module.ts
/**
 * @fileoverview Auth Module con Inyección Hexagonal
 * @module API/Auth
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// Ahora estos imports funcionarán correctamente:
import { UserRepositoryPort } from '@razworks/core';
import { DrizzleUserRepository } from '@razworks/database';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    // LA MAGIA: Cuando el Service pida el Puerto, Nest le da la Implementación Drizzle.
    {
      provide: UserRepositoryPort,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
