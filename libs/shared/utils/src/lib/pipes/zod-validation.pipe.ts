/**
 * @fileoverview Pipe Global de Validación Zod
 * @module Shared/Utils/Pipes
 * @description Transforma y valida payloads usando esquemas Zod.
 */
import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error,
      });
    }
  }
}
