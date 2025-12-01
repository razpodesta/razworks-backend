// apps/api/src/app/modules/auth/auth.service.ts
/**
 * @fileoverview Servicio de Autenticación (Refactorizado con Result Pattern)
 * @module API/Auth
 * @description
 * Orquestador blindado. Transforma errores de dominio en respuestas controladas.
 */
import { Injectable, InternalServerErrorException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { RegisterDto } from '@razworks/dtos';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRepositoryPort, User } from '@razworks/core';

export interface RegistrationResult {
  success: boolean;
  userId: string;
  message: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(
    private readonly userRepository: UserRepositoryPort
  ) {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_KEY'];

    if (!url || !key) {
      // Este es un error de configuración, aquí sí es válido lanzar excepción para detener el boot
      throw new Error('FATAL: Configuración de Supabase faltante en AuthService');
    }
    this.supabase = createClient(url, key);
  }

  onModuleInit() {
    this.logger.log('🔐 AuthService Initialized (Result Pattern V2)');
  }

  async register(dto: RegisterDto): Promise<RegistrationResult> {
    this.logger.log(`Intentando registrar usuario: ${dto.email}`);

    // 1. Validación de Dominio (Usando Result Pattern)
    const existsOrError = await this.userRepository.exists(dto.email);

    if (existsOrError.isFailure) {
      // Fallo de infraestructura (DB caída)
      throw new InternalServerErrorException(existsOrError.getError().message);
    }

    if (existsOrError.getValue()) {
      // Regla de Negocio
      throw new BadRequestException('El usuario ya existe en el sistema.');
    }

    // 2. Crear identidad en Provider (Supabase Auth - API Externa)
    // Nota: Supabase Client aún usa throw/return object, lo envolvemos
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName,
          role: dto.role
        }
      }
    });

    if (authError) {
      this.logger.warn(`Fallo en Identity Provider: ${authError.message}`);
      throw new BadRequestException(`Error en Auth Provider: ${authError.message}`);
    }

    if (!authData.user || !authData.user.id) {
      throw new InternalServerErrorException('Error crítico en creación de identidad');
    }

    const userId = authData.user.id;

    // 3. Crear Entidad de Dominio
    const newUser = new User(
      userId,
      dto.email,
      dto.fullName,
      dto.role,
      'THE_SCRIPT', // Default Realm
      new Date()
    );

    // 4. Persistir mediante Puerto (Result Pattern)
    const saveResult = await this.userRepository.save(newUser);

    if (saveResult.isFailure) {
      // Si falla el guardado local, tenemos un estado inconsistente (Auth sí, DB no).
      // En un sistema avanzado, aquí encolaríamos una tarea de compensación (Rollback).
      const error = saveResult.getError();
      this.logger.error(`❌ Fallo al guardar perfil de dominio para ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Identidad creada, pero falló la persistencia del perfil local.');
    }

    this.logger.log(`✅ Usuario registrado exitosamente: ${userId}`);

    return {
      success: true,
      userId: userId,
      message: 'Usuario registrado exitosamente en RazWorks',
    };
  }
}
