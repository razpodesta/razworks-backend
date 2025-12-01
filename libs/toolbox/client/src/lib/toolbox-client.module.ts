import { Module } from '@nestjs/common';
import { BudgetEstimatorTool } from './tools/budget-estimator.tool';

@Module({
  providers: [BudgetEstimatorTool],
  exports: [BudgetEstimatorTool],
})
export class ToolboxClientModule {}
