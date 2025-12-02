import { Injectable } from '@nestjs/common';
import { RazTool } from '@razworks/toolbox-shared';
import { BudgetEstimatorSchema, BudgetEstimatorDto } from '@razworks/dtos';
import { Result } from '@razworks/shared-utils'; // ✅ Import corregido
// RazterRealm eliminado de imports

export interface BudgetResult {
  cents: number;
  formatted: string;
  breakdown: { fee: number; base: number };
}

@Injectable()
export class BudgetEstimatorTool extends RazTool<BudgetEstimatorDto, BudgetResult> {
  // ... resto igual ...
}
