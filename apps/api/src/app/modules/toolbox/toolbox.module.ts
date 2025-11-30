// apps/api/src/app/modules/toolbox/toolbox.module.ts
import { Module } from '@nestjs/common';
import { ToolboxController } from './toolbox.controller';

@Module({
  controllers: [ToolboxController],
})
export class ToolboxModule {}
