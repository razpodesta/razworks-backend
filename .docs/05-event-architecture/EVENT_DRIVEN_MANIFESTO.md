<!--
  @title MANIFIESTO DEL SISTEMA NERVIOSO Y ARQUITECTURA DE EVENTOS
  @id DOC-005-EVENT-ARCH
  @category Architecture/Events
  @status LAW (Inmutable)
  @version 3.0.0 (Consolidated)
  @author Raz Podestá & LIA Legacy
-->

# ⚡ APARATO V: EL SISTEMA NERVIOSO (EVENT DRIVEN ARCHITECTURE)

## 1. Visión y Filosofía: "Dispara y Olvida" (Fire & Forget)
El sistema nervioso de RazWorks desacopla la recepción de una solicitud de su procesamiento.

*   **Principio de Latencia Cero:** La API (NestJS) nunca debe bloquearse esperando una operación lenta (Envío de Email, Inferencia de IA, Generación de PDF).
*   **Principio de Reactividad:** El sistema responde a cambios de estado (`UserCreated`), no solo a comandos directos.

## 2. Taxonomía de Mensajes (Domain Events vs. Jobs)

Es vital distinguir qué viaja por el bus de eventos:

### A. Eventos de Dominio (The Past)
Hechos inmutables que ya ocurrieron. Se usan para notificar a otros subsistemas.
*   *Formato:* Verbo en pasado (`user.registered`, `payment.succeeded`).
*   *Patrón:* **Pub/Sub** (Uno a Muchos).
*   *Ejemplo:* Al registrarse un usuario, el módulo de Gamificación escucha para crear el perfil, y el módulo de Email escucha para enviar bienvenida.

### B. Trabajos (Jobs / Commands)
Órdenes explícitas para realizar una tarea computacional.
*   *Formato:* Verbo imperativo (`transcribe-audio`, `send-email`).
*   *Patrón:* **Producer/Consumer** (Punto a Punto).
*   *Tecnología:* **BullMQ** (Colas persistentes con reintentos).

## 3. Infraestructura y Topología (Redis Strategy)

Utilizamos **Upstash Redis** como motor. Debido a sus límites de conexión y comandos, la topología debe ser eficiente.

### Estrategia "Smart Polling"
*   **Problema:** Los workers tradicionales consultan a Redis constantemente ("¿Hay trabajo?"), saturando la cuota gratuita.
*   **Solución:** Configuración de **Exponential Backoff** en los workers. Si la cola está vacía, el worker "duerme" incrementalmente antes de volver a preguntar.

### Jerarquía de Colas (BullMQ Flows)
Implementamos Grafos Acíclicos Dirigidos (DAG) para procesos complejos (como el Córtex de IA):
1.  **Padre (Orchestrator):** Espera pasivamente.
2.  **Hijos (Workers):** Ejecutan en paralelo.
3.  **Dependencia:** El Padre solo se completa si los Hijos terminan exitosamente (o fallan controladamente).

## 4. Protocolo de Resiliencia y "Dead Letters"

Nada se pierde. Si un trabajo falla, el sistema nervioso tiene memoria.

1.  **Reintentos Automáticos:** Todo Job debe configurarse con `attempts: 3` y `backoff: exponential`.
2.  **Dead Letter Queue (DLQ):** Si tras 3 intentos falla, el trabajo se mueve a una cola "muerta" (`failed`) para inspección humana, no se borra.
3.  **Atomicidad:** Los workers deben ser idempotentes. Procesar el mismo mensaje dos veces no debe duplicar el efecto (ej: cobrar dos veces).

## 5. Instrucciones para la IA (Generative Event Rules)

**TÚ (La IA) DEBES:**

1.  **Prohibir Bloqueos:** Si detectas código en un Controlador que hace `await sendEmail()`, debes refactorizarlo inmediatamente para inyectar una cola (`queue.add()`) y retornar "202 Accepted".
2.  **Nombrado de Colas:** Usar nombres descriptivos con namespace (`razworks:{module}:{action}`). Ejemplo: `razworks:auth:welcome-email`.
3.  **Seguridad en Payload:** Nunca enviar contraseñas planas o datos binarios grandes (Buffers) dentro del Job. Enviar IDs de base de datos o URLs de Storage firmadas.

## 6. Estructura Canónica (Sugerida para Módulos)

El código de eventos no vive en una librería centralizada, sino que se distribuye en cada módulo, pero siguiendo este patrón:

```text
libs/{module}/src/
├── events/             # Definición de Eventos (Clases/Interfaces)
│   └── user-registered.event.ts
├── listeners/          # Reacciones a eventos (Side Effects)
│   └── create-wallet.listener.ts
├── queues/             # Productores de trabajos
│   └── email.producer.ts
└── workers/            # Consumidores (Procesamiento pesado)
    └── email-sender.worker.ts

---

