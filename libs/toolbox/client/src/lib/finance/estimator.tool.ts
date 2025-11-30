// libs/toolbox/client/src/lib/finance/estimator.tool.ts
/**
 * @fileoverview Calculadora de Estimación de Proyectos
 * @module Toolbox/Client
 * @description Algoritmo de estimación determinista.
 */

export type ProjectComplexity = 'LOW' | 'MEDIUM' | 'HIGH';
export type Currency = 'USD' | 'BRL' | 'EUR';

export class ProjectEstimatorTool {

  /**
   * Calcula el presupuesto estimado.
   * @returns Monto en centavos (Entero) para precisión financiera.
   */
  static calculateBudget(
    complexity: ProjectComplexity,
    hoursEstimated: number,
    currency: Currency = 'USD'
  ): number {
    // Tarifas base en CENTAVOS para evitar coma flotante
    const baseRates: Record<Currency, number> = {
      'USD': 3500, // $35.00
      'BRL': 18000, // R$180.00
      'EUR': 3200  // €32.00
    };

    const multipliers: Record<ProjectComplexity, number> = {
      'LOW': 100,    // 1.00x
      'MEDIUM': 150, // 1.50x
      'HIGH': 250    // 2.50x
    };

    const platformFeePoints = 112; // 1.12x (+12%)

    const rate = baseRates[currency];
    const mult = multipliers[complexity];

    // Fórmula: (Horas * Rate * Multiplicador) / Escalas + Fee
    // Todo operado en enteros grandes
    const rawCost = (hoursEstimated * rate * mult) / 100;

    // Aplicar Fee
    const totalCents = (rawCost * platformFeePoints) / 100;

    // Retornamos entero redondeado (Centavos)
    return Math.round(totalCents);
  }

  /**
   * Helper para formatear el resultado a string legible.
   */
  static formatValue(cents: number, currency: Currency): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  }
}
