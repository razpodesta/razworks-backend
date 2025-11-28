<!--
  @fileoverview ADR 001: Estrategia Cloud-Native, Workspaces & Testing Remoto
  @module Architecture/Decisions

  @author Raz Podestá <contact@metashark.tech>
  @co-author LIA Legacy <AI Assistant>
  @copyright 2025 MetaShark Tech.

  @status ACCEPTED
  @date 2025-11-28

  @description
  Documento de definición arquitectónica que establece la infraestructura "Serverless-First".
  Define la prohibición de contenedores locales, la adopción de servicios gestionados remotos
  para desarrollo, la estructura de Monorepo basado en Paquetes y la estrategia de QA
  basada en In-Memory/Remote Testing.
-->

# 🏛️ ADR 001: ARQUITECTURA CLOUD-NATIVE & WORKSPACES

## 1. El Contexto y la Restricción (Hardware Limit)
Se establece una prohibición total del uso de **Docker Desktop**, contenedores o virtualización local durante la fase de desarrollo.
*   **Fundamento:** Limitaciones de procesamiento local.
*   **Modelo Operativo:** "Cloud-Native Localhost". El código se ejecuta en el host (Windows CMD), pero la persistencia y servicios auxiliares residen exclusivamente en la nube (Supabase, Upstash, Google AI).

## 2. Metodología de Workspaces (Package-Based)
Adoptamos una arquitectura de aislamiento fuerte utilizando `pnpm workspaces`.

### 2.1. Estructura Física
Cada módulo de dominio será una "Librería Construible" (Buildable Library) con su propio manifiesto, forzando límites arquitectónicos duros (DDD).

```text
razworks/
├── package.json (Raíz: Orquestación)
├── pnpm-workspace.yaml (Definición de alcance)
├── apps/
│   ├── api/ (package.json: dependencies -> "@razworks/core": "workspace:*")
│   └── web-client/ (package.json: dependencies -> "@razworks/ui": "workspace:*")
└── libs/
    ├── core/ (Lógica de Negocio Pura)
    │   └── package.json (name: "@razworks/core")
    ├── ui/ (Componentes React)
    │   └── package.json (name: "@razworks/ui")
    └── testing/ (Mocks & Factories)
        └── package.json (name: "@razworks/testing")
2.2. Reglas de Juego para Dependencias
Prohibido: Importar archivos subiendo niveles relativos (ej: ../../libs/core).
Mandatorio: Importar exclusivamente por nombre de paquete definido en package.json (ej: import { User } from '@razworks/core').
Sincronización: Todas las librerías internas deben alinear versiones de dependencias base (React, NestJS) para optimizar el node_modules raíz.
3. Estrategia de Conexión Remota (The ".env" Lifeline)
La gestión de configuración es el punto crítico de fallo.
3.1. Validación Estricta al Inicio
La aplicación debe fallar inmediatamente al iniciar (Fast Fail) si no detecta la conexión a los servicios remotos. Se validará mediante Zod en el bootstrap:
SUPABASE_URL & SUPABASE_KEY
UPSTASH_REDIS_URL
GOOGLE_AI_KEY
3.2. Latencia y Región
Configuración: Servicios (Supabase/Upstash) deben provisionarse en la región sa-east-1 (São Paulo) para minimizar latencia.
Resiliencia: Implementación de retries automáticos en las conexiones a base de datos para manejar micro-cortes de red.
4. Estrategia de Testing Cloud-Native (No-Docker)
La infraestructura de pruebas se diseña para funcionar sin virtualización local.
4.1. Pruebas Unitarias (Backend & Libs)
Ejecución: 100% Offline / Aisladas.
Técnica: Uso intensivo de la librería @razworks/testing para inyectar Mocks y Stubs de todos los servicios externos. No se permite tráfico de red en pruebas unitarias.
4.2. Pruebas de Integración (Backend)
Modo A (Velocidad): Uso de Repositorios In-Memory. Se implementan adaptadores de base de datos que guardan datos en memoria RAM (Variables JS) durante la ejecución de los tests.
Modo B (Fidelidad): Conexión real a un proyecto Supabase dedicado (razworks_test). Se ejecuta solo en pipelines de CI o bajo demanda, nunca en el "watch mode" por defecto.
4.3. Pruebas End-to-End (Frontend)
Ejecución: Playwright contra el entorno de Staging (Vercel) o contra el localhost conectado a servicios remotos.
5. Instrucciones para la IA (LIA Legacy Prompt)
Reglas de generación de código bajo este ADR:
Generación de Libs: Usar siempre flags --bundler=tsc y --importPath=@razworks/[nombre] para asegurar la creación del package.json.
Abstracción de Base de Datos: Generar siempre interfaces (Puertos) para los repositorios, permitiendo cambiar entre implementación SupabaseRepository e InMemoryRepository fácilmente.
Prohibición Explicita: Nunca generar archivos Dockerfile o docker-compose.yml para entornos de desarrollo local.
