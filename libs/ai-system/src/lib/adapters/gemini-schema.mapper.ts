/**
 * @fileoverview Mapeador de Esquemas Zod a Gemini (Function Calling)
 * @module AiSystem/Adapters
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Traduce la estructura estricta de Zod de las herramientas 'RazTool'
 * al formato 'FunctionDeclaration' que espera la API de Google GenAI.
 * Permite que la IA entienda qué parámetros requiere cada herramienta.
 */

import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { FunctionDeclaration, SchemaType } from '@google/genai';
// Nota: Ajustar importación según versión exacta del SDK instalada,
// asumimos compatibilidad con la interfaz FunctionDeclaration.

@Injectable()
export class GeminiSchemaMapper {

  /**
   * Convierte un esquema Zod y metadatos en una declaración de función para Gemini.
   * @param name Nombre técnico de la función (snake_case)
   * @param description Descripción natural para el LLM
   * @param zodSchema Esquema Zod de los parámetros
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public toGeminiFunction(name: string, description: string, zodSchema: z.ZodSchema<any>): FunctionDeclaration {
    return {
      name,
      description,
      parameters: this.zodToJsonSchema(zodSchema)
    };
  }

  /**
   * Motor de conversión recursivo Zod -> JSON Schema (Simplificado para Gemini).
   * Soporta: String, Number, Boolean, Enum, Object, Array.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private zodToJsonSchema(schema: z.ZodTypeAny): any {
    if (schema instanceof z.ZodObject) {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(schema.shape)) {
        properties[key] = this.zodToJsonSchema(value as z.ZodTypeAny);
        if (!(value as z.ZodTypeAny).isOptional()) {
          required.push(key);
        }
      }

      return {
        type: SchemaType.OBJECT,
        properties,
        required
      };
    }

    if (schema instanceof z.ZodString) {
      return { type: SchemaType.STRING };
    }

    if (schema instanceof z.ZodNumber) {
      return { type: SchemaType.NUMBER };
    }

    if (schema instanceof z.ZodBoolean) {
      return { type: SchemaType.BOOLEAN };
    }

    if (schema instanceof z.ZodEnum) {
      return {
        type: SchemaType.STRING,
        enum: schema._def.values
      };
    }

    if (schema instanceof z.ZodArray) {
      return {
        type: SchemaType.ARRAY,
        items: this.zodToJsonSchema(schema.element)
      };
    }

    // Fallback seguro para tipos complejos no mapeados
    return { type: SchemaType.STRING, description: "Complex type, provide as JSON string" };
  }
}
