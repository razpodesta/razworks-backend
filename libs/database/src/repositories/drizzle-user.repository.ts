/**
 * @fileoverview Repositorio de Usuarios (Implementación Drizzle)
 * @module Infra/Database/Repositories
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Implementación concreta del puerto `UserRepositoryPort`.
 * Maneja la tabla `profiles` que extiende la identidad de Supabase Auth.
 * Implementa patrón UPSERT para garantizar sincronización.
 */

import { Injectable, Logger } from '@nestjs/common';
import { User, UserRepositoryPort, AppError } from '@razworks/core';
import { Result } from '@razworks/shared/utils';
import { db } from '../client';
import { profilesTable } from '../schema/profiles.table';
import { UserMapper } from '../mappers/user.mapper';
import { eq } from 'drizzle-orm';

@Injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
  private readonly logger = new Logger(DrizzleUserRepository.name);

  /**
   * Busca usuario por ID (PK).
   */
  async findById(id: string): Promise<Result<User | null, Error>> {
    try {
      const result = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.id, id),
      });

      if (!result) return Result.ok(null);

      return Result.ok(UserMapper.toDomain(result));
    } catch (error) {
      this.logger.error(`Error finding user by ID [${id}]`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }

  /**
   * Busca usuario por Email (Índice único).
   */
  async findByEmail(email: string): Promise<Result<User | null, Error>> {
    try {
      const result = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.email, email),
      });

      if (!result) return Result.ok(null);

      return Result.ok(UserMapper.toDomain(result));
    } catch (error) {
      this.logger.error(`Error finding user by Email`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }

  /**
   * Verifica existencia por Email (Optimizado: SELECT 1).
   */
  async exists(email: string): Promise<Result<boolean, Error>> {
    try {
      // Drizzle 'findFirst' con columnas seleccionadas es eficiente
      const result = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.email, email),
        columns: { id: true } // Solo traemos el ID para minimizar transferencia
      });

      return Result.ok(!!result);
    } catch (error) {
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }

  /**
   * Guarda o actualiza un usuario (Upsert).
   * Vital para sincronizar con webhooks de Auth externos.
   */
  async save(user: User): Promise<Result<void, Error>> {
    try {
      await db.insert(profilesTable).values({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        currentRealm: user.realm, // Mapeo de Entidad a Columna
        avatarUrl: user.avatarUrl,
        totalXp: Number(user.metadata['totalXp'] || 0),
        reputationScore: Number(user.metadata['reputationScore'] || 100),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profilesTable.id,
        set: {
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          currentRealm: user.realm,
          updatedAt: new Date()
        }
      });

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(`Error saving user [${user.id}]`, error);
      return Result.fail(new AppError.DatabaseError(String(error)).getError());
    }
  }
}
