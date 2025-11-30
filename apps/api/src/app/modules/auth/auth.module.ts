// apps/api/src/app/modules/auth/auth.module.ts
/**
 * @fileoverview Módulo de Autenticación (Dependency Injection)
 * @module API/Auth
 * @description
 * Orquestador del dominio de identidad. Registra controladores y servicios.
 * Corrige el error de importación 'no exported member AuthModule'.
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [], // Aquí irían otros módulos si Auth dependiera de ellos (ej: UsersModule)
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Exportamos el servicio por si otros módulos necesitan validar tokens internamente
})
export class AuthModule {}
