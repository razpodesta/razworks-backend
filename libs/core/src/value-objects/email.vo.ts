/**
 * @fileoverview Value Object: Email
 * @module Core/ValueObjects
 * @author Raz Podestá & LIA Legacy
 * @description
 * Garantiza que un string sea un email válido y normalizado.
 * Utiliza Zod internamente para la validación de formato.
 */

import { z } from 'zod';
import { ValueObject } from '../base/value-object.base';
import { Result } from '@razworks/shared/utils';
import { AppError } from '../shared/app-error';

// Definición de esquema de validación interno
const emailSchema = z.string().email().toLowerCase().trim();

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(email: string): Result<Email, AppError.ValidationError> {
    const parseResult = emailSchema.safeParse(email);

    if (!parseResult.success) {
      return Result.fail(new AppError.ValidationError('Invalid email format.'));
    }

    return Result.ok(new Email(parseResult.data));
  }

  public get domain(): string {
    return this.props.value.split('@')[1];
  }
}
