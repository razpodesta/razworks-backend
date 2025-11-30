<!--
  @id DOC-AI-001
  @module @razworks/ai
  @type MANUAL
  @status ACTIVE
  @sdk @google/genai v1.30+
-->

# 🧠 RAZWORKS AI SYSTEM: MANUAL DE OPERACIONES

## 1. Visión General
La librería `@razworks/ai` es el **Motor Cognitivo** del monorepo. Encapsula la complejidad de interactuar con los Large Language Models (LLMs) de Google a través del adaptador unificado `GeminiAdapter`.

Su propósito es desacoplar la lógica de negocio (API) de la infraestructura de IA, permitiendo cambios de modelos, manejo de errores centralizado y optimización de costos sin tocar los controladores.

---

## 2. Configuración y Pre-requisitos

Para que este aparato funcione, el entorno debe cumplir estrictamente con lo siguiente:

### A. Variables de Entorno (.env)
La aplicación host (`apps/api`) debe tener definida:
```ini
GOOGLE_AI_KEY="tu_api_key_aqui"
Si esta variable falta, el adaptador lanzará una InternalServerErrorException al instanciarse.
B. Dependencias
El sistema se basa en el SDK unificado 2025:
@google/genai (v1.30.0 o superior)
3. Guía de Uso (API Pública)
La librería exporta una instancia Singleton llamada aiAdapter. No necesitas instanciar clases manualmente.
Importación
code
TypeScript
import { aiAdapter } from '@razworks/ai';
Caso de Uso A: Generación Rápida (Chat / Extracción)
Usa el modelo Flash para tareas que requieren baja latencia (chatbots, extracción de datos simples, resúmenes).
code
TypeScript
// En tu Servicio o Controlador
async function chatConUsuario(mensaje: string) {
  // Por defecto usa 'gemini-2.5-flash'
  const respuesta = await aiAdapter.generateText(mensaje);
  return respuesta;
}
Caso de Uso B: Razonamiento Profundo (Thinking Mode)
Usa el modelo Pro cuando necesites lógica compleja, evaluación psicológica de candidatos o arquitectura de software.
code
TypeScript
async function evaluarCandidato(cvData: string) {
  const prompt = `Analiza este perfil técnico y busca inconsistencias: ${cvData}`;

  // El segundo parámetro 'true' activa el modo Thinking/Pro
  const analisis = await aiAdapter.generateText(prompt, true);
  return analisis;
}
4. Arquitectura Interna y Modelos
El adaptador gestiona automáticamente la selección de modelos según la configuración del PDF "Estrategia 2025".
Modo	Modelo Subyacente	Caso de Uso Ideal	Costo
FAST (Default)	gemini-2.5-flash	Chat, Traducción, Parsing JSON simple	Bajo
THINKING	gemini-2.5-pro	Lógica compleja, Análisis de sentimientos, Code Review	Alto
LEGACY	gemini-1.5-flash	Fallback en caso de errores de disponibilidad	Bajo
Manejo de Errores (Resiliencia)
El adaptador intercepta errores crudos del SDK y los normaliza:
404 Not Found: Advierte si el modelo 2.5 no está disponible en tu Tier.
429 Too Many Requests: Identifica saturación de cuota.
Salida Vacía: Lanza error si la IA responde 200 OK pero sin texto (alucinación de silencio).
5. Potencialidades y Hoja de Ruta (Roadmap)
La implementación actual es la base. El SDK @google/genai permite expandir este adaptador con las siguientes capacidades futuras:
A. Salidas Estructuradas (JSON Schemas)
Actualmente devolvemos texto. El siguiente paso es forzar respuestas JSON estrictas usando responseSchema en la configuración del modelo.
Uso: Convertir CVs (PDF) directamente a objetos TypeScript CandidateDto.
B. Multimodalidad (Vision & Audio)
El método generateContent soporta arrays de Part.
Potencial: Pasar buffers de imágenes o audio directamente para que la IA "vea" el portafolio de un freelancer o "escuche" la entrevista.
C. Live API (WebSockets)
La clase GoogleGenAI expone capacidades live.
Potencial: Implementar entrevistas en tiempo real con interrupción de voz (barge-in) para el módulo "Speak to Hire".
D. Tools & Function Calling
Permitir que la IA ejecute código o busque en la base de datos.
Potencial: Que Gemini diga: "Necesito buscar proyectos de React" y el sistema ejecute la query SQL automáticamente.

---


