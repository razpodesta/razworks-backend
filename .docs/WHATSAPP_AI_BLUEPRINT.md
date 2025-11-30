<!--
  @fileoverview BLUEPRINT WA-AI-NEXUS: OMNICHANNEL CORTEX & NEURO-GRID
  @module Architecture/Core
  @status PRODUCTION - ELITE
  @author Raz Podestá & LIA Legacy
  @version 4.0.0 (Omnichannel Cortex Edition)

  @description
  Documento maestro que define la arquitectura "Next-Gen" del motor de comunicación.
  Supera la simple mensajería de texto implementando una "Cortex Omnicanal" capaz de
  ver (Visión), escuchar (Audio) y razonar (Thinking Mode) mediante flujos paralelos
  orquestados por BullMQ Pro y Gemini 2.5.
-->

# 🧠 WA-AI-NEXUS: ARQUITECTURA "OMNICHANNEL CORTEX"

**Visión:** RazWorks no es un chatbot. Es una Entidad de Inteligencia Sincrónica. El sistema actúa como un "Cortex Digital" que recibe estímulos sensoriales (Texto, Audio, Imagen), los procesa en lóbulos especializados en paralelo, y sintetiza una respuesta estratégica.

---

## 1. Concepto Arquitectónico: "The Sensory Fan-Out"

El sistema abandona el procesamiento lineal. Al recibir un estímulo, el **Dispatcher** atomiza el mensaje y activa los "Lóbulos Cognitivos" necesarios según el tipo de medio.

### 1.1. El Flujo de Vida (DAG - Directed Acyclic Graph)

1.  **Estímulo (Trigger):** Webhook de Meta (Texto, Audio o Imagen).
2.  **Normalización (Gateway):** Se convierte el payload sucio de Meta en un `InternalMessagePayload` estricto y tipado.
3.  **Dispersión Sensorial (Fan-Out):**
    *   *Si es Audio:* Se activa el **AudioWorker** (Descarga + Transcripción + Corrección Semántica).
    *   *Si es Imagen:* Se activa el **VisionWorker** (Análisis de pixel + Descripción técnica).
    *   *Siempre:* Se activan en paralelo:
        *   **SentimentWorker:** Análisis emocional del contexto o caption.
        *   **SecurityWorker:** Escaneo de amenazas, fraude y *Prompt Injection*.
4.  **Recolección (Fan-In):** El **OrchestratorWorker** espera a que todos los sentidos terminen.
5.  **Síntesis Cognitiva:** El Orquestador fusiona: `{ transcripción, análisis_visual, sentimiento, seguridad }`.
6.  **Razonamiento (Thinking Mode):** Se invoca a Gemini 2.5 Pro con un System Prompt dinámico para generar la estrategia de respuesta.
7.  **Ejecución:** Envío de respuesta (Texto o Multimedia) y registro en Ledger.

---

## 2. Stack Tecnológico & Decisiones de Ingeniería

### 2.1. Backend (NestJS + BullMQ Flows)
*   **Gateway:** Capa Anti-Corrupción que normaliza datos y filtra eventos de estado (`statuses`).
*   **Motor de Flujos:** **BullMQ Flows**. Permite dependencias Padre-Hijo. El Padre (Orquestador) no arranca hasta que los Hijos (Sentidos) retornan sus datos.
*   **Resiliencia:** Configuración de `backoff` exponencial y reintentos automáticos (3 intentos) para fallos de red o API de IA.

### 2.2. Inteligencia Artificial (Estrategia Híbrida)
*   **Lóbulos (Workers):** Gemini 1.5 Flash / Whisper. Rápidos, especializados.
*   **Cortex (Orquestador):** Gemini 2.5 Pro. Usado en modo `thinking: true` para razonamiento complejo y manejo de matices.
*   **Técnica "Audio Repair":** No usamos transcripción cruda. Pasamos la salida del ASR por un LLM para corregir jerga técnica ("reacti" -> "React").

### 2.3. Contrato de Datos (Strict Typing)
El sistema se rige por una interfaz inmutable interna, desacoplada de la API de Meta.

```typescript
export interface InternalMessagePayload {
  readonly id: string;
  readonly from: string;
  readonly type: 'text' | 'audio' | 'image' | 'interactive';
  readonly text?: string;       // Contenido normalizado
  readonly mediaUrl?: string;   // URL para descarga
  readonly traceId: string;     // Observabilidad distribuida
}
3. Estructura de Módulos (libs/whatsapp-engine)
La librería refleja la anatomía del cerebro digital.
code
Text
libs/whatsapp-engine/src/
├── gateway/                # (DEPRECATED - Moved to lib)
├── lib/
│   ├── whatsapp.controller.ts      # Entrada HTTP (Webhook)
│   └── whatsapp-engine.module.ts   # Ensamblaje del Cortex
├── services/
│   ├── whatsapp-gateway.service.ts # Normalizador y Filtro
│   └── conversation-flow.service.ts # Producer (Dispatcher)
├── workers/
│   ├── audio.worker.ts             # Oído (Speech-to-Text + Correction)
│   ├── vision.worker.ts            # Ojos (Image-to-Text)
│   ├── sentiment.worker.ts         # Amígdala (Emotion Analysis)
│   ├── security.worker.ts          # Sistema Inmune (Safety)
│   └── orchestrator.worker.ts      # Lóbulo Frontal (Decision & Reply)
└── dto/
    └── webhook.schema.ts           # Zod Schemas de Meta
4. Protocolos de Seguridad y Observabilidad
4.1. Trazabilidad (Trace ID)
Cada interacción genera un traceId único (cortex-TIMESTAMP-HASH) en el momento de la ingestión. Este ID viaja por todos los workers, logs y llamadas a la IA, permitiendo una depuración forense completa de "por qué la IA dijo eso".
4.2. Zero-Trust Security
El SecurityWorker es bloqueante. Si detecta intención maliciosa, insultos graves o intentos de jailbreak, el flujo se corta antes de llegar al Orquestador, protegiendo el consumo de tokens del modelo Pro y la reputación de la marca.
4.3. Manejo de Errores (Normalization)
Todos los try/catch implementan una normalización de errores (unknown -> Error) para garantizar que ningún fallo silencioso detenga la cola de procesamiento.
5. Hoja de Ruta de Evolución (Next Steps)
Implementación de VisionWorker: Crear el worker capaz de entender diagramas de arquitectura enviados por foto.
Voice-Out: Integrar ElevenLabs para que RazWorks pueda responder con notas de voz, completando el ciclo "Speak to Hire".
Flows Nativos: Integrar WhatsApp Flows (UI JSON) para formularios de cotización estructurados dentro del chat.

---


