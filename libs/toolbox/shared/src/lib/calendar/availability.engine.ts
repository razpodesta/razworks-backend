// libs/toolbox/shared/src/lib/calendar/availability.engine.ts
/**
 * @fileoverview Motor de Disponibilidad y Zonas Horarias
 * @module Toolbox/Shared
 */

export interface TimeSlot {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export interface UserAvailability {
  userId: string;
  timezone: string; // IANA: 'America/Sao_Paulo'
}

export class AvailabilityEngine {
  /**
   * Encuentra slot común a las 14:00 UTC (MVP Mock).
   * Refactorizado para usar Date objects de forma segura.
   */
  static findCommonSlots(dateInput: string | Date): TimeSlot[] {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Validar fecha
    if (isNaN(date.getTime())) {
      throw new Error('Invalid Date provided to AvailabilityEngine');
    }

    const commonSlots: TimeSlot[] = [];

    // Normalización a UTC mediodía
    const slotStart = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      14, 0, 0
    ));

    const slotEnd = new Date(slotStart);
    slotEnd.setUTCHours(slotStart.getUTCHours() + 1);

    commonSlots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString()
    });

    return commonSlots;
  }

  /**
   * Valida si una zona horaria es legítima en el entorno de ejecución (Node/Browser).
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      // ✅ FIX: Optional catch binding. Variable 'e' eliminada.
      return false;
    }
  }
}
