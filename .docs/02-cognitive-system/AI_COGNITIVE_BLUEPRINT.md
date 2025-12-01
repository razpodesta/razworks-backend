<!--
  @title BLUEPRINT DEL CÓRTEX COGNITIVO Y ARQUITECTURA DE PENSAMIENTO
  @id DOC-002-AI-CORTEX
  @category Architecture/AI
  @status LAW (Inmutable)
  @version 3.1.0 (Rich-Content)
  @author Raz Podestá & LIA Legacy
-->

# 🧠 APARATO II: EL CÓRTEX COGNITIVO (AI SYSTEM)

## 1. Filosofía: "Entidad, no Herramienta"
La IA es una **Entidad Virtual** llamada **Cortex**.
*   **Roles:**
    *   *Architect:* (Modelo Pro) Razonamiento complejo.
    *   *Clerk:* (Modelo Flash) Velocidad/Traducción.
    *   *Sentry:* (Regex/Modelo Pequeño) Seguridad.

## 2. Arquitectura de Resiliencia (Fallback Chain)
1.  **Primario:** `gemini-1.5-pro` (Latest).
2.  **Secundario:** `gemini-1.5-flash` (Si Pro falla/timeout).
3.  **Circuit Breaker:** Respuesta determinista si Google cae.

## 3. Protocolo de Procesamiento (Fan-Out/Fan-In)
1.  **Estímulo:** Audio/Texto/Imagen.
2.  **Dispersión:** Workers paralelos (*AudioWorker*, *VisionWorker*, *SecurityWorker*).
3.  **Síntesis:** El `Orchestrator` espera a todos.
4.  **Razonamiento:** Modelo *Architect* genera respuesta final.

## 4. Ingeniería de Prompts
Estructura obligatoria: **[IDENTITY] - [CONTEXT] - [TASK] - [CONSTRAINTS] - [OUTPUT]**.

## 5. Estructura Canónica (`libs/ai-system`)
```text
libs/ai-system/src/
├── adapters/           # GeminiAdapter, OpenAIAdapter
├── orchestration/      # Fallback logic
├── prompts/            # Templates versionados
└── roles/              # Interfaces de Agentes
6. Implementación Técnica (BullMQ Flows)
El sistema usa Grafos Acíclicos Dirigidos (DAG) en BullMQ.
Patrón: FlowProducer.
Jerarquía: Un Job "Padre" (Orchestrator) espera a que terminen los Jobs "Hijos" (Sentidos).
Fail-Fast: Si el SecurityWorker (Hijo) detecta amenaza, el Padre debe abortar la llamada a la IA para ahorrar costos.
7. 💻 GUÍA DE DESARROLLO (Usage Manual)
A. Inyección del Adaptador
El AiModule exporta un Singleton aiAdapter.
code
TypeScript
import { aiAdapter } from '@razworks/ai';

// Uso Básico (Clerk Role - Flash Model)
const chatResponse = await aiAdapter.generateText("Hola mundo");

// Uso Avanzado (Architect Role - Pro Model + Thinking)
const analysis = await aiAdapter.generateText(
  complexPrompt,
  { role: 'ARCHITECT', temperature: 0.7 }
);
B. Manejo de Errores
El adaptador ya captura excepciones. El consumidor debe manejar el string vacío o el Result.fail si se implementa el patrón Result.

---


