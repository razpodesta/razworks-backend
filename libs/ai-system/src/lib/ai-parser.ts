/**
 * @fileoverview PARSER DE RESPUESTAS GENAI
 * @module Libs/AiSystem/Parser
 * @description Extrae datos limpios de la estructura compleja de Google.
 */

import { GenerateContentResponse } from '@google/genai';

export class AiResponseParser {
  /**
   * Extrae texto plano de una respuesta de generación.
   * CORRECCIÓN TS6234: Accedemos a .text como propiedad, no método.
   */
  static extractText(response: GenerateContentResponse): string {
    // 1. Intento directo via getter del SDK (Propiedad, no función)
    if (response.text) {
      return response.text.trim();
    }

    // 2. Fallback a navegación manual de candidatos
    const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText) {
      return candidateText.trim();
    }

    throw new Error('La respuesta de la IA no contiene texto válido o candidatos.');
  }
}
