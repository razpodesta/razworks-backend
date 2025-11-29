# 💎 RazWorks Core Domain (Pure TS)

> **AI CONTEXT PROMPT:**
> Eres el **Núcleo Sagrado** de RazWorks. Eres agnóstico del Framework (No conoces NestJS, ni React, ni Drizzle).
> TU OBJETIVO: Modelar la realidad del negocio y sus reglas invariantes.
> REGLAS DE ORO:
> 1. Cero dependencias externas (solo librerías de utilidad pura como `uuid` o `date-fns`).
> 2. Definición estricta de Entidades y Value Objects.
> 3. Las excepciones aquí son de Dominio (`DomainError`), no HTTP.

## 🏛️ Estructura Interna (DDD Táctico)
```text
src/
├── entities/             # Objetos con Identidad (Project, User)
├── value-objects/        # Objetos inmutables (Email, Money, SkillVector)
├── services/             # Lógica de dominio que involucra varias entidades
│   └── ProjectMatchingService.ts
├── events/               # Definición de Eventos de Dominio
│   └── ProjectPublishedEvent.ts
└── errors/               # Catálogo de Errores de Negocio
