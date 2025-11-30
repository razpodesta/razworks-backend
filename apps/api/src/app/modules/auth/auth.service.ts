// apps/api/src/app/modules/auth/auth.service.ts
/**
 * @fileoverview Servicio de Autenticación (Business Logic)
 * @module API/Auth
 * @author Raz Podestá & LIA Legacy
 * @description
 * Maneja la dualidad de identidad:
 * 1. Supabase Auth (Identity Provider)
 * 2. Drizzle ORM (Perfil de Negocio)
 */
import { Injectable, InternalServerErrorException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { RegisterDto } from '@razworks/dtos';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, profilesTable } from '@razworks/database';

// Definimos interfaz de respuesta para no usar 'any' ni objetos anónimos
export interface RegistrationResult {
  success: boolean;
  userId: string;
  message: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor() {
    // Validación de entorno (Fail Fast)
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_KEY'];

    if (!url || !key) {
      throw new Error('FATAL: Configuración de Supabase faltante en AuthService');
    }

    this.supabase = createClient(url, key);
  }

  onModuleInit() {
    this.logger.log('🔐 AuthService Initialized connected to Identity Provider');
  }

  /**
   * Registra un nuevo usuario en el ecosistema (Identity + Profile).
   * @param dto Datos validados por Zod
   */
  async register(dto: RegisterDto): Promise<RegistrationResult> {
    this.logger.log(`Intentando registrar usuario: ${dto.email} [Role: ${dto.role}]`);

    // 1. Crear usuario en Supabase Auth (Identity Provider)
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName, // Metadata en JWT
          role: dto.role
        }
      }
    });

    if (authError) {
      this.logger.warn(`Fallo en Identity Provider: ${authError.message}`);
      throw new BadRequestException(`Error en Auth Provider: ${authError.message}`);
    }

    if (!authData.user || !authData.user.id) {
      this.logger.error('Identity Provider retornó éxito pero no devolvió User ID');
      throw new InternalServerErrorException('Error crítico en creación de identidad');
    }

    const userId = authData.user.id;

    // 2. Crear perfil público en nuestra DB (Drizzle - Core Domain)
    try {
      this.logger.debug(`Creando perfil de dominio para ID: ${userId}`);

      await db.insert(profilesTable).values({
        id: userId, // Vinculación FK Estricta
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        // 'createdAt' y 'updatedAt' se manejan por default en DB
      });

      this.logger.log(`✅ Usuario registrado exitosamente: ${userId}`);

      return {
        success: true,
        userId: userId,
        message: 'Usuario registrado exitosamente en RazWorks',
      };

    } catch (error: unknown) {
      // Manejo de errores tipado (Zero-Any Policy)
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`❌ Fallo al crear perfil de dominio para ${userId}`, err.stack);

      // NOTA: Aquí idealmente haríamos un rollback borrando el usuario de Auth,
      // pero Supabase Auth Admin API requiere service_role key.
      // Por ahora, lanzamos error para que el cliente lo sepa.

      throw new InternalServerErrorException('Identidad creada, pero falló la creación del perfil. Contacte soporte.');
    }
  }
}
