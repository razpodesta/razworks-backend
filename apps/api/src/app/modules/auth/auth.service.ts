/**
 * @fileoverview Servicio de Autenticación (Implementation)
 * @module API/Auth
 * @author Raz Podestá & LIA Legacy
 * @description
 * Orquesta el registro y login.
 * Implementa Patrón Result y Arquitectura Hexagonal.
 */

import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserRepositoryPort, User, UserRole, RazterRealm } from '@razworks/core';
import { RegisterDto, LoginDto } from '@razworks/dtos';
import { Result } from '@razworks/shared/utils';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    // Inyección de Puerto (El adaptador Drizzle se inyecta en el Módulo)
    private readonly userRepo: UserRepositoryPort
  ) {}

  /**
   * Registra un nuevo usuario en el ecosistema.
   */
  async register(dto: RegisterDto): Promise<Result<{ userId: string }, Error>> {
    this.logger.log(`Intentando registrar usuario: ${dto.email}`);

    // 1. Verificación de Existencia (Fail Fast)
    const existsResult = await this.userRepo.exists(dto.email);
    if (existsResult.isFailure) return Result.fail(existsResult.getError());
    if (existsResult.getValue()) {
      return Result.fail(new BadRequestException('El usuario ya existe.'));
    }

    // 2. Creación de Entidad de Dominio (Factory Pattern)
    const userId = randomUUID();

    // ✅ FIX TS2339: User.create ahora existe en la entidad
    // ✅ FIX TS2693: RazterRealm es un Enum importado, no un Type
    const newUserResult = User.create(
      userId,
      dto.email,
      dto.fullName,
      dto.role as UserRole,
      RazterRealm.THE_SCRIPT, // Realm por defecto
      new Date(),
      undefined,
      { source: 'web_register' }
    );

    if (newUserResult.isFailure) {
      return Result.fail(newUserResult.getError());
    }

    // 3. Persistencia
    const saveResult = await this.userRepo.save(newUserResult.getValue());
    if (saveResult.isFailure) {
      this.logger.error(`Error persistiendo usuario: ${saveResult.getError().message}`);
      return Result.fail(new InternalServerErrorException('Error al crear perfil.'));
    }

    this.logger.log(`✅ Usuario registrado exitosamente: ${userId}`);
    return Result.ok({ userId });
  }

  /**
   * Login simple (Stub para integración futura).
   */
  // ✅ FIX Linter: Usamos el dto para loguear el intento, evitando 'unused var'
  async login(dto: LoginDto): Promise<Result<{ token: string }, Error>> {
    this.logger.debug(`Login attempt for: ${dto.email}`);

    // En arquitectura Supabase, el login lo maneja el cliente directo contra GoTrue.
    // El backend solo valida el JWT. Este método es un placeholder.
    return Result.ok({ token: 'mock_jwt_token_for_dev' });
  }
}
