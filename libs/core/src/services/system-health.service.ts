/**
 * @fileoverview Servicio de Dominio para Estado del Sistema
 * @module Core/Services
 * @author Raz Podestá <contact@metashark.tech>
 */

// NOTA: En Core puro no importamos DTOs ni NestJS. Retornamos interfaces puras o tipos primitivos.
// El mapeo a DTO ocurre en la capa de aplicación (API).

export interface SystemStatus {
  isHealthy: boolean;
  systemTime: Date;
  coreVersion: string;
}

export class SystemHealthService {
  static check(): SystemStatus {
    return {
      isHealthy: true,
      systemTime: new Date(),
      coreVersion: '1.0.0-razworks',
    };
  }
}
