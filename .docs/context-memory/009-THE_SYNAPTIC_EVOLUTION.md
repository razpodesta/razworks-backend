<!--
  @id 009-THE-SYNAPTIC-EVOLUTION
  @type ARCHITECTURE
  @status ACTIVE
  @version 1.0.0
  @date 2025-12-01
-->

# 🧠 LA EVOLUCIÓN SINÁPTICA: DE CHATBOT A AGENTE (CÓRTEX V2)

## 📖 The Storytelling
Hasta la versión anterior, RazWorks era un sistema reactivo: recibía mensajes y generaba texto. Era un "Loro Sofisticado". Para cumplir la visión de "Zero-Friction", el sistema necesitaba **Agencia**: la capacidad de usar herramientas, calcular presupuestos y manipular archivos sin intervención humana.
Además, detectamos ineficiencias críticas: consultas repetitivas a la DB para metadatos estáticos y llamadas redundantes a la IA para inputs idénticos.

## 🏛️ The Decision (Arquitectura de Élite)

### 1. Optimización de Memoria (Database Module)
*   **Patrón:** *In-Memory Dictionary Cache*.
*   **Cambio:** Se creó `DictionaryManagerService`. Los códigos de acción (`AUTH_LOGIN`, `WA_MSG_IN`) y los Reinos (`THE_KERNEL`) se cargan en RAM al inicio (`OnModuleInit`).
*   **Impacto:** Eliminación del 99% de JOINs en operaciones de escritura de logs y notificaciones. Latencia de resolución: ~0ms.

### 2. El Córtex V2 (AI System)
Se implementó una arquitectura de "Smart Proxy" en capas:
*   **Capa 1 (Ahorro):** `SemanticCacheService`. Hashea el input (SHA-256). Si ya se pensó, no se recalcula.
*   **Capa 2 (Finanzas):** `TokenMeterService`. Registra el consumo de tokens y costo estimado en `audit_logs`.
*   **Capa 3 (Agencia):** `AgenticCoordinatorService`. Implementa el bucle *Pensar -> Detectar Herramienta -> Ejecutar -> Responder*.

### 3. Estandarización de Herramientas (Toolbox)
Se definió el contrato `RazTool`. Cada herramienta ahora expone:
*   **Schema (Zod):** Para validación y generación de JSON Schema para la IA.
*   **Metadata:** Nombre y descripción para el prompt del sistema.
*   **RequiredRealm:** Seguridad declarativa basada en Gamificación.

### 4. Sistema Nervioso Agéntico (WhatsApp)
El `OrchestratorWorker` ahora inyecta dinámicamente las herramientas disponibles en el contexto de la IA basándose en el nivel (Realm) del usuario.

## 🤖 AI MEMORY HOOK
*   **AL CREAR HERRAMIENTAS:** Debes extender `RazTool` y registrarlas en `ToolboxModule`.
*   **AL MODIFICAR PROMPTS:** No uses strings mágicos. Usa `PromptRegistry` en `libs/ai-system`.
*   **AL CONSULTAR DICCIONARIOS:** Inyecta `DictionaryManagerService`, no hagas `db.select` a las tablas `dic_*`.

---

