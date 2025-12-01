/**
 * @fileoverview Catálogo de Errores de Aplicación (ES Modules Standard)
 * @module Core/Shared
 * @author Raz Podestá & LIA Legacy
 * @description
 * Define errores semánticos del dominio.
 * REFACTOR: Eliminado 'namespace' en favor de exportaciones directas para cumplir
 * con @typescript-eslint/no-namespace.
 */

// Base abstracta para errores tipados
export abstract class DomainError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    // Fix para 'instanceof' en TypeScript al extender nativos
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnexpectedError extends DomainError {
  constructor(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    super('GENERIC_SYSTEM_ERROR', `Unexpected: ${message}`);
  }
}

export class ValidationError extends DomainError {
  constructor(debugMessage: string) {
    super('VALIDATION_FAILED', debugMessage);
  }
}

export class DatabaseError extends DomainError {
  constructor(debugMessage: string) {
    super('PERSISTENCE_ERROR', debugMessage);
  }
}

export class InsufficientFundsError extends DomainError {
  constructor() {
    super('INSUFFICIENT_FUNDS', 'The operation requires more funds than available.');
  }
}

// Alias de compatibilidad (Opcional) para facilitar la transición
// Permite importar como: import { AppError } ... y usar AppError.ValidationError
export const AppError = {
  DomainError,
  UnexpectedError,
  ValidationError,
  DatabaseError,
  InsufficientFundsError
} as const;
