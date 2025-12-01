/**
 * @fileoverview Herramienta: Estimador de Presupuesto (Standardized)
 * @module Toolbox/Client/Tools
 */

import { Injectable } from '@nestjs/common';
import { RazTool } from '@razworks/toolbox-shared';
import { BudgetEstimatorSchema, BudgetEstimatorDto } from '@razworks/dtos';
import { RazterRealm } from '@razworks/core';
import { Result } from '@razworks/shared/utils';

// Definimos la salida estructurada
export interface BudgetResult {
  cents: number;
  formatted: string;
  breakdown: { fee: number; base: number };
}

@Injectable()
export class BudgetEstimatorTool extends RazTool<BudgetEstimatorDto, BudgetResult> {
  constructor() {
    super(
      {
        name: 'estimate_project_budget',
        description: 'Calcula un rango de presupuesto estimado basado en horas y complejidad. Útil cuando el cliente pregunta "¿Cuánto costará esto?".',
        requiredRealm: 'THE_SCRIPT' // Accesible para todos (Clientes nuevos)
      },
      BudgetEstimatorSchema
    );
  }

  protected async execute(params: BudgetEstimatorDto): Promise<Result<BudgetResult, Error>> {
    const { complexity, hoursEstimated, currency } = params;

    // Constantes de Negocio (Podrían venir de DB en el futuro)
    const baseRates: Record<string, number> = { 'USD': 3500, 'BRL': 18000, 'EUR': 3200 };
    const multipliers: Record<string, number> = { 'LOW': 100, 'MEDIUM': 150, 'HIGH': 250 };
    const feeMultiplier = 1.12; // 12% Platform Fee

    const rate = baseRates[currency] || baseRates['USD'];
    const mult = multipliers[complexity];

    // Cálculo en centavos
    const rawCost = (hoursEstimated * rate * mult) / 100;
    const totalCents = Math.round(rawCost * feeMultiplier);
    const feeCents = totalCents - Math.round(rawCost);

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(totalCents / 100);

    return Result.ok({
      cents: totalCents,
      formatted,
      breakdown: {
        base: Math.round(rawCost),
        fee: feeCents
      }
    });
  }
}
