<!--
  @fileoverview Protocolo Maestro de Ejecución, Calidad y Arquitectura Modular
  @module Infrastructure/Standards

  @author Raz Podestá <raz.podesta@metashark.tech>
  @copyright 2025 MetaShark Tech - Florianópolis, SC. All rights reserved.
  @license UNLICENSED - Proprietary Software.

  @description
  Directiva MANDATORIA para el desarrollo en RazWorks. Define el uso estricto de pnpm,
  entorno Windows CMD, Linting moderno (Flat Config) y la arquitectura de "Aparatos"
  modulares bajo principios SOLID/DRY.

  @requires @nx/devkit
  @requires pnpm
  @version 3.0.0 (Strict Windows/pnpm Edition)
-->

# 🛡️ PROTOCOLO MAESTRO DE INGENIERÍA: RAZWORKS

## 1. Directiva de Entorno y Paquetería (MANDATORIO)

### 1.1. Motor de Dependencias: `pnpm`
Está **prohibido** el uso de `npm` o `yarn`. Toda instalación o ejecución debe pasar por el algoritmo de resolución de `pnpm` para garantizar eficiencia de disco y velocidad en el monorepo.

*   ❌ `npm install` / `npm run`
*   ✅ `pnpm install` / `pnpm run` / `pnpm exec nx`

### 1.2. Entorno Operativo: Windows 10 CMD
Todos los comandos proporcionados por la IA deben ser nativos para **Command Prompt (cmd.exe)**.
*   **Prohibido:** Sintaxis Bash (`ls`, `export`, `&&` condicional complejo), sintaxis PowerShell (`$env:VAR`).
*   **Mandatorio:**
    *   Comentarios con `REM`.
    *   Variables con `set`.
    *   Concatenación simple.

## 2. Verificación de Comandos Nx (Live Web Search)
Debido a la rápida obsolescencia de la base de datos interna de la IA frente a Nx v20+:

1.  **🔍 BÚSQUEDA WEB OBLIGATORIA:** Antes de generar un script, LIA Legacy debe consultar [nx.dev](https://nx.dev) para validar la sintaxis vigente.
2.  **✅ SINTAXIS:** Usar `nx add` para plugins y `nx g` para generadores.
3.  **⚠️ VALIDACIÓN:** No inventar flags. Si la IA no está segura, debe indicarlo.

## 3. Calidad de Código y Linting (Flat Config)
RazWorks utiliza el sistema moderno **ESLint Flat Config** (`eslint.config.js`).

*   **Regla de Oro:** El código entregado **NUNCA** debe contener violaciones de linter.
*   **Pre-Entrega:** LIA Legacy debe simular mentalmente la validación de reglas:
    *   No `any` explícitos (TypeScript Strict).
    *   No importaciones circulares.
    *   No variables no utilizadas.
*   **Comando de Verificación:**
    ```cmd
    pnpm nx run-many -t lint
    ```

## 4. Arquitectura de "Aparatos" Modulares (The Apparatus Philosophy)

Definimos un **Aparato** como una unidad funcional autocontenida, reutilizable y agnóstica.

### 4.1. Principios de Diseño
*   **Plug-and-Play:** Un aparato (`libs/ai-speech`) debe poder desconectarse de la API y conectarse a un CLI sin romper nada.
*   **DRY (Don't Repeat Yourself):** Si una validación se usa en 2 lugares, se abstrae a `@razworks/shared/utils`.
*   **SOLID:**
    *   *SRP:* Un archivo, una responsabilidad.
    *   *DIP:* Los módulos de alto nivel no dependen de implementaciones, sino de interfaces (definidas en `@razworks/shared/interfaces`).

### 4.2. Alias de Rutas (Path Aliases)
En `tsconfig.base.json`, se usarán nombres descriptivos y jerárquicos bajo el namespace `@razworks`.

| Alias | Descripción | Ejemplo de Uso |
| :--- | :--- | :--- |
| `@razworks/core/*` | Lógica de negocio pura y entidades | `import { Project } from '@razworks/core/entities'` |
| `@razworks/ports/*` | Interfaces de adaptadores (Hexagonal) | `import { IAiProvider } from '@razworks/ports/ai'` |
| `@razworks/ui/*` | Componentes visuales (Shared) | `import { Button } from '@razworks/ui/primitives'` |
| `@razworks/dtos` | Contratos de datos Zod | `import { CreateProjectDto } from '@razworks/dtos'` |

## 5. Estándar de Documentación TSDoc (Non-Negotiable)
Cada archivo debe contar con metadata para contexto de IA y humanos.

```typescript
/**
 * @fileoverview [Propósito del Aparato/Archivo]
 * @module [Namespace, ej: @razworks/ai-core]
 *
 * @author Raz Podestá <raz.podesta@metashark.tech>
 * @copyright 2025 MetaShark Tech.
 * @license UNLICENSED
 *
 * @description
 * [Explicación técnica profunda de la implementación]
 */
6. Referencia de Comandos Windows/pnpm (Cheat Sheet)
Acción	Comando CMD (Windows)
Instalar Dependencia	pnpm add [paquete]
Instalar DevDep	pnpm add -D [paquete]
Generar App NestJS	pnpm nx g @nx/nest:app apps/api
Generar Lib	pnpm nx g @nx/js:lib libs/shared/my-lib
Levantar Entorno	pnpm nx serve api
Limpiar Caché Nx	pnpm nx reset

---


