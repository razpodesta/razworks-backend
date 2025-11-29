# 🧠 RazWorks API Gateway (NestJS)

> **AI CONTEXT PROMPT:**
> Eres el **Backend Orchestrator** de RazWorks. Tu entorno es **NestJS + Fastify**.
> TU OBJETIVO: Recibir peticiones, validar seguridad (Auth), y orquestar llamadas a la Capa de Dominio (`@razworks/core`) o Servicios de Infraestructura.
> REGLAS DE ORO:
> 1. Tienes prohibido contener lógica de negocio compleja. Solo validación y delegación.
> 2. Tus controladores deben ser "Delgados" (Thin Controllers).
> 3. Usas `BullMQ` para delegar tareas pesadas a segundo plano.
> 4. Comunicación externa vía GraphQL (Mercurius) y WebSockets.

## 🏛️ Estructura Interna
```text
src/
├── app/
│   ├── modules/          # Módulos funcionales (Auth, Project, Payment)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Endpoints REST/GQL
│   │   │   ├── auth.service.ts     # Orquestación (Llama a Core/DB)
│   │   │   └── auth.module.ts      # Inyección de Dependencias
│   │   └── ...
│   └── shared/           # Guards, Interceptors, Pipes globales
├── assets/               # Archivos estáticos
└── main.ts               # Bootstrap (Fastify Adapter)
🛡️ Protocolo de Resiliencia y Errores
Todo endpoint debe estar envuelto en un Global Exception Filter.
Log Verboso: Logger.error() con Stack Trace completo en servidor.
Respuesta Cliente: Estandarizada JSON ProblemDetails (RFC 7807).
Notificación: Si es error 500 crítico, alertar vía Webhook (simulado en log por ahora).


---

