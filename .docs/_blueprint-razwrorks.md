ÍNDICE MAESTRO DEL PROYECTO:
1. 📄 Resumen Ejecutivo y Visión
1.1. Definición del Producto: Propuesta de valor (IA First, Zero-Friction).
1.2. Objetivos del MVP: Alcance funcional crítico vs. Deseable.
1.3. Modelo de Negocio (Técnico): Estrategia "Zero-Cost" para infraestructura inicial.
2. 🏗 Arquitectura y Stack Tecnológico (Deep Dive)
2.1. Diagrama de Alto Nivel: Interacción entre Vercel, Render, Supabase y Upstash.
2.2. Selección de Tecnologías (Justificación):
2.2.1. Monorepo: Nx (Gestión de workspace).
2.2.2. Backend: NestJS + Fastify (Performance).
2.2.3. Frontend: Next.js (App Router) + Tailwind + Shadcn/UI.
2.2.4. Base de Datos: Supabase (Postgres + pgvector + Auth).
2.2.5. Eventos y Caché: Upstash Redis + BullMQ.
2.2.6. Inteligencia Artificial: Adapter Pattern (Gemini Pro / Groq).
2.3. Diseño de Solución Desacoplada: Estrategia de comunicación asíncrona (Event-Driven).
3. 📏 Convenciones de Ingeniería y Estándares de Código
3.1. Principios de Diseño:
3.1.1. Aplicación de SOLID en NestJS (Inyección de Dependencias).
3.1.2. Estrategia DRY (Don't Repeat Yourself) mediante Librerías Compartidas Nx (libs/shared).
3.1.3. KISS (Keep It Simple, Stupid) en la lógica de controladores.
3.2. Estilo de Código y Linter:
3.2.1. Configuración estricta de ESLint + Prettier.
3.2.2. Reglas de nombrado (Variables, Clases, Interfaces, DTOs).
3.2.3. Conventional Commits (feat, fix, chore, refactor) y Husky pre-commit hooks.
3.3. Performance First:
3.3.1. Uso de DTOs serializados (evitar clases pesadas en runtime).
3.3.2. Lazy Loading en Frontend y Backend Modules.
3.3.3. Estrategias de Caché (TTL, Invalidación) en Redis.
3.4. Seguridad:
3.4.1. Sanitización de Inputs (Zod Pipelines).
3.4.2. Rate Limiting (ThrottlerGuard).
3.4.3. Manejo de Secretos (Variables de Entorno y .env.vault).
4. 🧪 Estrategia de Testing y QA (Ruta Espejo)
4.1. Filosofía de Pruebas: Pirámide de Testing (Unit > Integration > E2E).
4.2. Estructura de Directorios Espejo:
4.2.1. src/modules/auth/auth.service.ts vs test/unit/auth/auth.service.spec.ts.
4.2.2. test/e2e/auth/login.e2e-spec.ts.
4.3. Fábrica de Mocks Centralizada (Mock Factory Pattern):
4.3.1. Creación de libs/testing/src/factories/user.factory.ts.
4.3.2. Generadores de datos aleatorios con Faker.js.
4.3.3. Mocks de servicios externos (SupabaseMock, AiServiceMock) para desarrollo offline.
5. 📦 Estructura del Monorepo (Nx Workspace)
5.1. Apps:
apps/api: Backend NestJS.
apps/web-client: Frontend Next.js.
5.2. Libs (Librerías Compartidas):
libs/shared/dtos: Zod Schemas compartidos (Contrato único).
libs/shared/types: Interfaces TypeScript puras.
libs/ui-kit: Componentes visuales reutilizables.
libs/ai-core: Lógica agnóstica de conexión con LLMs.
6. 🚀 Definición del MVP (Alcance Funcional)
6.1. Módulo de Autenticación: Login Social, JWT, RBAC (Roles: Client, Freelancer, Admin).
6.2. Módulo de IA Conversacional (Core):
Ingesta de Audio/Texto.
Procesamiento asíncrono (Colas).
Generación de Borrador de Proyecto.
6.3. Módulo de Proyectos: CRUD, Publicación, Indexado Vectorial.
6.4. Módulo de Marketplace: Búsqueda semántica, Listado, Filtros.
6.5. Módulo de Propuestas: Envío básico de ofertas por parte del freelancer.
7. 📅 Roadmap de Ejecución (Sprints Tácticos)
Sprint 0: "The Foundation" (Infraestructura y Configuración)
7.0.1. Inicialización de Nx Workspace y configuración de TypeScript Strict Mode.
7.0.2. Configuración de CI/CD (GitHub Actions) para linting y testing básico.
7.0.3. Setup de Infraestructura Gratuita:
Proyecto Supabase (DB + Auth).
Cluster Upstash Redis.
API Keys (Google AI, Groq).
7.0.4. Creación de libs/shared/dtos y configuración de Zod.
Sprint 1: "Identity & Core Backend" (Auth & DB)
7.1.1. Backend: Configuración de Drizzle ORM y Migraciones iniciales.
7.1.2. Backend: Implementación de Supabase Auth Guard en NestJS (Passport Strategy).
7.1.3. Frontend: Layout base con Shadcn/UI y configuración de next-intl.
7.1.4. Frontend: Páginas de Login/Registro y Onboarding de Usuario.
Sprint 2: "The AI Brain" (Lógica de Negocio Compleja)
7.2.1. Backend: Creación del AiModule y AiService (Adapter Pattern).
7.2.2. Backend: Implementación de BullMQ (Producer/Consumer) para tareas pesadas.
7.2.3. Backend: Integración con Google Gemini (Prompt Engineering para análisis de requisitos).
7.2.4. Backend: Endpoint de subida de Audio y transcriptor (Whisper o Gemini Multimodal).
7.2.5. Testing: Unit tests de los Parsers de IA y Mocks de respuestas LLM.
Sprint 3: "Conversational UI" (Frontend IA & Real-time)
7.3.1. Backend: Implementación de Server-Sent Events (SSE) para stream de respuestas.
7.3.2. Frontend: Componente AudioRecorder con visualización de ondas.
7.3.3. Frontend: Chat UI con estados optimistas ("Escribiendo...", "Procesando").
7.3.4. Integración: Flujo completo "Voz -> Texto -> Pregunta de IA -> Respuesta Usuario".
Sprint 4: "Project Genesis" (Estructuración de Datos)
7.4.1. Backend: Lógica de conversión "Conversación -> JSON Estructurado (Proyecto)".
7.4.2. Backend: Guardado de Proyecto y generación de Embeddings (pgvector).
7.4.3. Frontend: Vista de "Revisión de Borrador" (Formulario pre-llenado por IA).
7.4.4. Backend: Publicación final y notificación (Email transaccional simulado).
Sprint 5: "The Marketplace" (Búsqueda y Propuestas)
7.5.1. Backend: Implementación de Búsqueda Semántica (Vector Search en Supabase).
7.5.2. Frontend: Dashboard de Freelancer (Feed de proyectos recomendados).
7.5.3. Frontend: Página de Detalle de Proyecto.
7.5.4. Backend: Endpoint para enviar propuesta simple.
Sprint 6: "Launch Prep" (Optimización y Despliegue)
7.6.1. Auditoría de Performance (Lighthouse, Bundle Analyzer).
7.6.2. Configuración de "Cold Start" mitigation (Health Checks).
7.6.3. Testing E2E crítico (Flujo completo de publicación).
7.6.4. Despliegue a Producción (Vercel Main + Render Main).

DESARROLLO:

📘 RAZWORKS: BLUEPRINT DEL PROYECTO (Conceptual & Estratégico)

1. Identidad del Proyecto y Metadatos Globales
Antes de escribir lógica, definimos la identidad que vivirá en el package.json y en los encabezados de cada archivo. Esto asegura la propiedad intelectual y el rastro de nuestra cocreación.

1.1. Configuración del package.json Raíz
Este bloque define la autoría y la naturaleza privada del código.

{
  "name": "razworks-backend",
  "version": "1.0.0",
  "description": "High-performance Core API for RazWorks: The AI-First Freelance Marketplace. Features Generative AI integration, Voice Processing, and Intelligent Matchmaking. Powered by NestJS & Fastify.",
  "license": "UNLICENSED",
  "private": true,
  "author": {
    "name": "Raz Podestá",
    "email": "raz.podesta@metashark.tech",
    "url": "https://www.razworks.com",
    "organization": "MetaShark Tech",
    "location": "Florianópolis, Santa Catarina, Brazil"
  },
  "homepage": "https://www.razworks.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/metashark-tech/razworks.git"
  }
}

1.2. Estándar de Documentación TSDoc (Convención Obligatoria)
Cada archivo .ts o .tsx debe iniciar con este bloque de documentación para mantener el contexto para futuras iteraciones de IA y desarrolladores humanos.

/**
 * @fileoverview [Descripción breve del propósito del archivo]
 * @module [Nombre del Módulo, ej: IdentityAccess]
 *
 * @author Raz Podestá <raz.podesta@metashark.tech>
 * @copyright 2025 MetaShark Tech - Florianópolis, SC. All rights reserved.
 * @license UNLICENSED - Proprietary Software.
 *
 * @description
 * [Descripción detallada técnica. Qué hace este archivo, qué patrones usa,
 * y por qué se tomó esta decisión arquitectónica.]
 *
 * @requires [Dependencia clave, ej: AuthGuard]
 * @version 1.0.0
 */

2. Resumen Ejecutivo y Propuesta Única de Valor (UVP)

2.1. La Visión
RazWorks no es otro tablón de anuncios de trabajo. Es un Hub de Colaboración Asistida. Eliminamos la fricción de la contratación remota utilizando Inteligencia Artificial Generativa como mediadora activa, no pasiva.

2.2. El Problema (Pain Points)
Clientes: No saben redactar requerimientos técnicos. Escriben "Quiero una web" y reciben 50 propuestas basura. Frustración y pérdida de tiempo.
Freelancers: Pierden horas descifrando clientes vagos o compitiendo por precio en lugar de valor.

2.3. La Solución RazWorks (UVP)
"Speak to Hire": El cliente no llena formularios. Habla. La IA (LIA Legacy Engine) entrevista al cliente, estructura el proyecto y define el stack técnico.
Zero-Waste Matching: Los freelancers solo reciben notificaciones de proyectos que realmente encajan con su perfil vectorial, no spam.
Internacionalización Nativa: Un cliente habla en portugués (BR) y el freelancer lee el requerimiento en inglés o español, traducido y contextualizado técnicamente en tiempo real.

3. Sistema de Gamificación "Razters Ecosystem"
Para retener usuarios sin presupuesto de marketing masivo, implementaremos mecánicas de juego profundas inspiradas en la "Cadena Alimenticia del Océano" (Branding Razters).

3.1. Gamificación para Freelancers (Razters)
El objetivo es incentivar la calidad, la velocidad de respuesta y la fidelidad.

VERS SISTEMA DE GAMIFICACION EN ARCHIVO razters-gamificacion-y-badgets.md

Incentivos:
Claridad de Cristal: Si la IA no tiene que hacer preguntas extra porque el audio inicial fue perfecto, gana puntos de "Eficiencia".
Pago Veloz: Liberar el escrow (pago en garantía) en menos de 24h tras la entrega.

Beneficios:
Los clientes con alto nivel ("Poseidon Rank") aparecen primero en el feed de los mejores freelancers.
Descuentos en fees de procesamiento de pagos.


---

