/**
 * @fileoverview DIAGNÓSTICO MAESTRO: GOOGLE GENAI (STANDALONE)
 * @description
 * Prueba de conectividad aislada usando @google/genai (Clase GoogleGenAI).
 * Útil para descartar problemas de NestJS vs problemas de Red/API.
 *
 * @author Raz Podestá & LIA Legacy
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURACIÓN VISUAL (ANSI COLORS) ---
const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Modelo rápido para ping
const TARGET_MODEL = 'gemini-2.5-flash';

async function runDiagnostic() {
  console.log(`\n${C.bold}${C.cyan}🧠 DIAGNÓSTICO DE IA (SCRIPT AISLADO)${C.reset}`);
  console.log(`${C.dim}================================================================${C.reset}`);

  // 1. VALIDACIÓN DE ENTORNO
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    console.error(`\n${C.red}❌ [FATAL] No se encontró la variable GOOGLE_AI_KEY en .env${C.reset}`);
    process.exit(1);
  }

  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`🔑 API Key:             ${C.bold}${maskedKey}${C.reset}`);
  console.log(`🤖 Modelo Objetivo:     ${C.yellow}${TARGET_MODEL}${C.reset}`);

  try {
    // 2. INICIALIZACIÓN (Usando la clase correcta GoogleGenAI)
    console.log(`\n${C.dim}🔄 Conectando con Google Cloud...${C.reset}`);
    const client = new GoogleGenAI({ apiKey });

    // 3. EJECUCIÓN DE PRUEBA
    console.log(`⚡ Enviando Prompt de prueba...`);
    const start = performance.now();

    const response = await client.models.generateContent({
      model: TARGET_MODEL,
      contents: [{
        role: 'user',
        parts: [{ text: 'Responde solo con la palabra: "CONECTADO"' }]
      }],
      config: {
        temperature: 0.0,
      }
    });

    const duration = (performance.now() - start).toFixed(2);

    // 4. PARSING ROBUSTO (Igual que en libs/ai-system)
    let outputText = 'SIN_RESPUESTA';

    if (response.text) {
        // En v1.30, .text() suele ser una función
        outputText = typeof response.text === 'function' ? response.text() : response.text;
    } else if (response.candidates && response.candidates.length > 0) {
        outputText = response.candidates[0].content?.parts?.[0]?.text;
    }

    if (!outputText) {
        console.dir(response, { depth: 3 });
        throw new Error('Respuesta vacía o estructura desconocida');
    }

    // Limpieza
    outputText = outputText.trim();

    // 5. REPORTE
    console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);
    console.log(`📥 Respuesta:  "${C.bold}${outputText}${C.reset}"`);
    console.log(`⏱️  Latencia:   ${duration}ms`);

    if (outputText.includes('CONECTADO')) {
      console.log(`\n${C.green}${C.bold}✅ CONEXIÓN EXITOSA (STANDALONE)${C.reset}`);
    } else {
      console.log(`\n${C.yellow}⚠️  La IA respondió algo inesperado, pero conectó.${C.reset}`);
    }

  } catch (error) {
    console.log(`\n${C.red}${C.bold}❌ FALLO LA CONEXIÓN${C.reset}`);
    console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);

    const msg = error.message || 'Error desconocido';
    console.error(`${C.red}🛑 Error: ${msg}${C.reset}`);

    if (msg.includes('404')) {
      console.log(`\n${C.yellow}💡 HINT: El modelo '${TARGET_MODEL}' no existe. Prueba 'gemini-1.5-flash'.${C.reset}`);
    } else if (msg.includes('429')) {
      console.log(`\n${C.yellow}💡 HINT: Has excedido tu cuota (Rate Limit).${C.reset}`);
    } else {
      console.log(`\n${C.dim}Stack Trace:${C.reset}`);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runDiagnostic();
