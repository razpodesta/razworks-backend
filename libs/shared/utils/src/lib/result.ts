/**
 * @fileoverview Implementación del Patrón Result (Monada) - FIXED
 * @module Shared/Utils/Result
 * @description
 * Estructura monádica para manejo de errores funcional.
 * Soporta genéricos explícitos <T, E> para evitar inferencias incorrectas.
 */

export class Result<T, E = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _error: E | undefined;
  private readonly _value: T | undefined;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A successful result cannot contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result must contain an error');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cant retrieve value from failed result. Error: ${this._error}`);
    }
    return this._value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Cant retrieve error from successful result');
    }
    return this._error as E;
  }

  // Factories Estáticas con Tipado Explícito

  public static ok<U, F = Error>(value: U): Result<U, F> {
    return new Result<U, F>(true, undefined, value);
  }

  public static fail<U, F = Error>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }
}
