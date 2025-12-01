/**
 * @fileoverview Mapper de Usuario (Infra -> Domain)
 * @module Infra/Database/Mappers
 * @author Raz Podestá & LIA Legacy
 * @description
 * Convierte filas crudas de PostgreSQL en Entidades Ricas del Dominio.
 * Realiza la reconstitución segura utilizando las Factories del Core.
 */

import { User, RazterRealm, UserRole } from '@razworks/core';
import { InferSelectModel } from 'drizzle-orm';
import { profilesTable } from '../schema/profiles.table';

// Tipo inferido directamente del esquema Drizzle
type DbUser = InferSelectModel<typeof profilesTable>;

export class UserMapper {
  /**
   * Convierte un registro de BD a Entidad de Dominio.
   * @throws Error si los datos de la BD violan las reglas del Dominio (Data Integrity Breach).
   */
  static toDomain(raw: DbUser): User {
    const userResult = User.create(
      raw.id,
      raw.email,
      raw.fullName,
      raw.role as UserRole,
      raw.currentRealm as RazterRealm,
      raw.createdAt || new Date(),
      raw.avatarUrl || undefined,
      {
        totalXp: raw.totalXp,
        reputationScore: raw.reputationScore,
      }
    );

    if (userResult.isFailure) {
      // Si fallamos al leer de la DB, es una corrupción de datos grave.
      // No es un error de validación de usuario, es un error de sistema.
      throw new Error(
        `[DATA INTEGRITY ERROR] Could not reconstitute User ${raw.id}: ${userResult.getError().message}`
      );
    }

    return userResult.getValue();
  }

  /**
   * Mapeo inverso implícito:
   * El repositorio se encarga de descomponer la entidad (user.email.value) para escribir.
   */
}
