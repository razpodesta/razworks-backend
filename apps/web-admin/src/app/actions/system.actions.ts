// apps/web-admin/src/app/actions/system.actions.ts
/**
 * @fileoverview Server Actions para Datos del Sistema
 * @description Actúa como BFF (Backend for Frontend).
 *              Ejecuta fetch seguro S2S (Server-to-Server) hacia NestJS.
 */
'use server';

import { secureFetch } from '../../lib/utils/api-client';
import { HealthStatusDto } from '@razworks/dtos'; // Importamos tipos compartidos

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface SystemDashboardData {
  health: HealthStatusDto;
  isConnected: boolean;
}

/**
 * Obtiene el estado de salud del Backend de forma segura.
 * Esta función se llama desde los React Server Components.
 */
export async function getSystemStatus(): Promise<SystemDashboardData> {
  try {
    // 1. Llamada firmada con HMAC al endpoint raíz (Health Check)
    const response = await secureFetch<Record<string, never>>(`${API_URL}`, {});

    if (!response.ok) {
      console.error('[SystemAction] Health Check Failed:', response.status);
      return createFallback('Error de API');
    }

    const data: HealthStatusDto = await response.json();

    return {
      health: data,
      isConnected: true
    };

  } catch (error) {
    console.error('[SystemAction] Connection Refused:', error);
    return createFallback('Desconectado');
  }
}

function createFallback(message: string): SystemDashboardData {
  return {
    isConnected: false,
    health: {
      status: 'down',
      service: 'RazWorks API',
      timestamp: new Date().toISOString(),
      version: '0.0.0',
      message
    }
  };
}
