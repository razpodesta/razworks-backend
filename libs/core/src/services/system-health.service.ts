// libs/core/src/services/system-health.service.ts
/**
 * @fileoverview Servicio de Diagnóstico del Sistema (Real-time)
 * @module Core/Services
 */

import * as os from 'os';

export interface SystemStatus {
  isHealthy: boolean;
  systemTime: Date;
  coreVersion: string;
  uptime: number;
  memoryUsage: {
    heapUsed: number; // MB
    heapTotal: number; // MB
    rss: number; // MB
  };
  host: string;
}

export class SystemHealthService {
  private static readonly VERSION = '1.2.0-razworks';

  static check(): SystemStatus {
    const mem = process.memoryUsage();

    // Conversión a MB para legibilidad humana
    const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;

    return {
      isHealthy: true,
      systemTime: new Date(),
      coreVersion: this.VERSION,
      uptime: process.uptime(),
      host: os.hostname(),
      memoryUsage: {
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        rss: toMB(mem.rss),
      }
    };
  }
}
