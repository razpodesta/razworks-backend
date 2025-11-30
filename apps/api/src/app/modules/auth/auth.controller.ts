// apps/api/src/app/modules/auth/auth.controller.ts
/**
 * @fileoverview Controlador de Autenticación
 * @module API/Auth
 */
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterSchema } from '@razworks/dtos';
// IMPORTACIÓN CORRECTA DESDE LA LIBRERÍA COMPARTIDA (DRY)
import { ZodValidationPipe } from '@razworks/shared/utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(RegisterSchema)) body: RegisterDto) {
    return this.authService.register(body);
  }
}
