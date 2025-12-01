/**
 * @fileoverview Catálogo de Errores de Aplicación
 * @module Core/Shared
 * @description
 * Define errores semánticos que el dominio entiende, desacoplados de HTTP.
 */

import { Result } from '@razworks/shared/utils';

export namespace AppError {
  export class UnexpectedError extends Result<never, Error> {
    constructor(err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      super(false, new Error(`Error Inesperado: ${message}`));
    }
  }

  export class ValidationError extends Result<never, Error> {
    constructor(message: string) {
      super(false, new Error(`Validación Fallida: ${message}`));
    }
  }

  export class DatabaseError extends Result<never, Error> {
    constructor(message: string) {
      super(false, new Error(`Error de Persistencia: ${message}`));
    }
  }
}
