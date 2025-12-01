/**
 * @fileoverview Módulo de Base de Datos (Infraestructura)
 * @module Infra/Database
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Módulo Global que exporta los servicios de persistencia y gestión de diccionarios.
 * Al ser Global, no necesita ser importado en cada submódulo de la API.
 */

import { Module, Global } from '@nestjs/common';
import { DictionaryManagerService } from '../services/dictionary-manager.service';
import { DrizzleUserRepository } from '../repositories/drizzle-user.repository';
import { DrizzleProjectRepository } from '../repositories/drizzle-project.repository';
// Importamos los puertos del Core para hacer el binding
import { UserRepositoryPort, ProjectRepositoryPort } from '@razworks/core';

@Global()
@Module({
  providers: [
    // Lógica de Soporte
    DictionaryManagerService,

    // Repositorios (Binding Hexagonal)
    {
      provide: UserRepositoryPort,
      useClass: DrizzleUserRepository,
    },
    {
      provide: ProjectRepositoryPort,
      useClass: DrizzleProjectRepository,
    },
  ],
  exports: [
    DictionaryManagerService,
    UserRepositoryPort, // Exportamos los Tokens de Inyección, no las clases concretas
    ProjectRepositoryPort,
  ],
})
export class DatabaseModule {}
