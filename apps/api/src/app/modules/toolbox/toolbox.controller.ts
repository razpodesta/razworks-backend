// apps/api/src/app/modules/toolbox/toolbox.controller.ts
/**
 * @fileoverview Controlador de Herramientas (Toolbox)
 * @module API/Toolbox
 * @description Endpoints para utilidades de negocio. Refactorizado para Logging y Clean Code.
 */
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ZodValidationPipe } from '@razworks/shared/utils';
import {
  BudgetEstimatorSchema, BudgetEstimatorDto,
  MediaConversionSchema, MediaConversionDto,
  AvailabilityCheckSchema, AvailabilityCheckDto
} from '@razworks/dtos';
import { ProjectEstimatorTool } from '@razworks/toolbox-client';
import { FileConverterTool } from '@razworks/toolbox-razter';
import { AvailabilityEngine } from '@razworks/toolbox-shared';

@Controller('toolbox')
export class ToolboxController {
  // Inyección de Logger según Protocolo de Observabilidad
  private readonly logger = new Logger(ToolboxController.name);

  @Post('estimate')
  async estimateProject(@Body(new ZodValidationPipe(BudgetEstimatorSchema)) dto: BudgetEstimatorDto) {
    // Herramienta Pública/Cliente
    const cents = ProjectEstimatorTool.calculateBudget(dto.complexity, dto.hoursEstimated, dto.currency);
    const formatted = ProjectEstimatorTool.formatValue(cents, dto.currency);

    return {
      estimated_budget_cents: cents,
      display_value: formatted,
      breakdown: {
        hours: dto.hoursEstimated,
        complexity: dto.complexity
      }
    };
  }

  @Post('convert')
  // Nota: AuthGuard se implementará cuando el módulo de usuarios esté activo
  async convertMedia(@Body(new ZodValidationPipe(MediaConversionSchema)) dto: MediaConversionDto) {
    const mockUserTier = 'PLANKTON'; // Simulamos nivel bajo para pruebas

    this.logger.log(`Solicitud de conversión de medios: ${dto.fileId} a ${dto.targetFormat}`);

    const result = await FileConverterTool.convert({
      fileId: dto.fileId,
      targetFormat: dto.targetFormat,
      razterTier: mockUserTier
    });

    if (result.status === 'DENIED') {
      this.logger.warn(`Conversión denegada: Nivel insuficiente (${mockUserTier})`);
      return { success: false, ...result };
    }

    return { success: true, ...result };
  }

  @Get('availability')
  checkAvailability(@Query(new ZodValidationPipe(AvailabilityCheckSchema)) query: AvailabilityCheckDto) {
    try {
      // Validar zona horaria
      if (!AvailabilityEngine.isValidTimezone(query.userTimezone)) {
        throw new InternalServerErrorException('Invalid Timezone');
      }

      const slots = AvailabilityEngine.findCommonSlots(query.date);
      return { date: query.date, slots };
    } catch (error: unknown) {
      // FIX: Uso de la variable 'error' para loguear antes de lanzar excepción
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error en Availability Engine: ${errMessage}`);

      throw new InternalServerErrorException('Availability Engine Error');
    }
  }
}
