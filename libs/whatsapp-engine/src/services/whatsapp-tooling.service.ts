/**
 * @fileoverview Servicio de Aprovisionamiento de Herramientas (Tool Provisioner)
 * @module WhatsApp/Services
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Responsable de hidratar el 'ToolRegistry' con las herramientas concretas
 * disponibles para el canal de WhatsApp.
 * Conecta el 'Toolbox' (Negocio) con el 'ToolRegistry' (Infraestructura).
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ToolRegistryService } from '@razworks/toolbox-shared';
import { BudgetEstimatorTool } from '@razworks/toolbox-client';
import { MediaConverterTool } from '@razworks/toolbox-razter';

@Injectable()
export class WhatsAppToolingService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppToolingService.name);

  constructor(
    private readonly registry: ToolRegistryService,
    // Inyección de Herramientas Concretas
    private readonly budgetTool: BudgetEstimatorTool,
    private readonly mediaTool: MediaConverterTool
  ) {}

  onModuleInit() {
    this.logger.log('🧰 Provisioning WhatsApp Agent Tools...');

    // 1. Registrar Herramientas Financieras (Clientes)
    this.registry.register(this.budgetTool);

    // 2. Registrar Herramientas de Producción (Freelancers/Razters)
    this.registry.register(this.mediaTool);

    this.logger.log('✅ Agent Tools Loaded & Ready for Inference.');
  }
}
