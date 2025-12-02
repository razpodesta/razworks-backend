/**
 * @fileoverview Módulo Compartido de Toolbox (Infrastructure Layer)
 * @module Toolbox/Shared
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Provee la infraestructura base para las herramientas:
 * 1. ToolRegistryService (Singleton): Donde se registran las herramientas al iniciar.
 * 2. Motores compartidos (Availability, Validations).
 *
 * @pattern Global Module: Se marca como global para asegurar que el 'Registry'
 * sea una instancia única (Singleton) en toda la aplicación, permitiendo que
 * un módulo registre herramientas y otro las lea.
 */

import { Module, Global } from '@nestjs/common';
import { ToolRegistryService } from './registry/tool-registry.service';

@Global()
@Module({
  providers: [
    ToolRegistryService
  ],
  exports: [
    ToolRegistryService
  ],
})
export class ToolboxSharedModule {}
