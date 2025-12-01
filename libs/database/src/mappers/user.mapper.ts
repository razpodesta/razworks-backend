// libs/database/src/mappers/user.mapper.ts
/**
 * @fileoverview Mapper de Usuario (Infra -> Domain)
 * @module Infra/Database/Mappers
 */
import { User, RazterRealm, UserRole } from '@razworks/core';
import { InferSelectModel } from 'drizzle-orm';
import { profilesTable } from '../schema/profiles.table';

type DbUser = InferSelectModel<typeof profilesTable>;

export class UserMapper {
  static toDomain(raw: DbUser): User {
    return new User(
      raw.id,
      raw.email,
      raw.fullName,
      raw.role as UserRole,
      // Casting seguro al nuevo tipo
      raw.currentRealm as RazterRealm,
      raw.createdAt || new Date(),
      raw.avatarUrl || undefined,
      {
        totalXp: raw.totalXp,
        reputationScore: raw.reputationScore,
      }
    );
  }
}
