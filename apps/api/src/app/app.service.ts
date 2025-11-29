import { Injectable } from '@nestjs/common';
import { SystemHealthService } from '@razworks/core';
import { HealthStatusDto } from '@razworks/dtos';

@Injectable()
export class AppService {
  getData(): HealthStatusDto {
    // 1. Llamamos al Core (Dominio puro)
    const coreStatus = SystemHealthService.check();

    // 2. Mapeamos a DTO (Contrato público)
    return {
      status: coreStatus.isHealthy ? 'ok' : 'down',
      version: coreStatus.coreVersion,
      timestamp: coreStatus.systemTime.toISOString(),
      service: 'RazWorks API Gateway',
      message: 'Hello World from Cloud-Native Architecture',
    };
  }
}
