/**
 * @fileoverview Contratos de Autenticación
 * @module Shared/DTOs/Auth
 * @author Raz Podestá <contact@metashark.tech>
 */
import { z } from 'zod';

// Login Input
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// Register Input
export const RegisterSchema = LoginSchema.extend({
  fullName: z.string().min(3, { message: 'Nome completo é obrigatório' }),
  role: z.enum(['CLIENT', 'FREELANCER'], { required_error: 'Selecione um perfil' }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
