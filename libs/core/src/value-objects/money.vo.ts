/**
 * @fileoverview Value Object: Dinero (Money)
 * @module Core/ValueObjects
 * @author Raz Podestá & LIA Legacy
 * @description
 * Manejo seguro de dinero utilizando el patrón de "Enteros Atómicos" (Centavos).
 * Previene errores de punto flotante IEEE 754.
 */

import { ValueObject } from '../base/value-object.base';
import { AppError } from '../shared/app-error';
import { Result } from '@razworks/shared/utils';

export type Currency = 'USD' | 'BRL' | 'EUR';

interface MoneyProps {
  amount: number; // Siempre en centavos
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super({ value: props });
  }

  /**
   * Factory estática para crear dinero de forma segura.
   * @param amount Cantidad en centavos (ej: 1000 = $10.00)
   * @param currency Código de moneda ISO
   */
  public static create(amount: number, currency: Currency): Result<Money, AppError.ValidationError> {
    if (!Number.isInteger(amount)) {
      return Result.fail(new AppError.ValidationError('Money amount must be an integer (cents).'));
    }

    if (amount < 0) {
        return Result.fail(new AppError.ValidationError('Money amount cannot be negative.'));
    }

    // Validaciones de moneda adicionales podrían ir aquí

    return Result.ok(new Money({ amount, currency }));
  }

  /**
   * Suma dos cantidades monetarias de la misma divisa.
   */
  public add(other: Money): Result<Money, AppError.ValidationError> {
    if (this.props.value.currency !== other.props.value.currency) {
      return Result.fail(new AppError.ValidationError('Cannot add money with different currencies.'));
    }

    return Money.create(this.props.value.amount + other.props.value.amount, this.props.value.currency);
  }

  public get amount(): number {
    return this.props.value.amount;
  }

  public get currency(): Currency {
    return this.props.value.currency;
  }

  /**
   * Formatea para visualización humana (Solo lectura).
   * @returns string formateado (ej: "$ 10.00")
   */
  public get formatted(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.props.value.currency
    }).format(this.props.value.amount / 100);
  }
}
