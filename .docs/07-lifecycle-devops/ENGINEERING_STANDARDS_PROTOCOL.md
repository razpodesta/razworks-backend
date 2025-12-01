<!--
  @title PROTOCOLO MAESTRO DE INGENIERÍA Y ESTÁNDARES DE EJECUCIÓN
  @id DOC-007-ENGINEERING
  @category DevOps/Standards
  @status LAW (Inmutable)
  @version 4.0.0 (Windows/pnpm Optimized)
  @author Raz Podestá & LIA Legacy
-->

# 🛡️ PROTOCOLO MAESTRO DE INGENIERÍA: RAZWORKS

## 1. Directiva de Entorno y Paquetería (MANDATORIO)

Para garantizar la reproducibilidad del "Cloud-Native Localhost", el entorno de desarrollo es estricto.

### 1.1. Motor de Dependencias: `pnpm`
El uso de `npm` o `yarn` está **estrictamente prohibido**. Toda instalación, ejecución de scripts o gestión de dependencias debe pasar por el algoritmo de resolución de enlaces duros de `pnpm`.

*   ❌ **Prohibido:** `npm install`, `npm run build`, `npx nx`.
*   ✅ **Mandatorio:** `pnpm install`, `pnpm run build`, `pnpm exec nx`.

### 1.2. Entorno Operativo: Windows 10 CMD
Todos los comandos proporcionados por la IA deben ser nativos para **Command Prompt (cmd.exe)**. No se asume la existencia de WSL, Bash o PowerShell.

*   **Variables:** Usar `set VAR=value` (Jamás `export`).
*   **Listados:** Usar `dir` (Jamás `ls`).
*   **Concatenación:** Evitar `&&` complejos si no son estrictamente necesarios para la secuencia.
*   **Comentarios:** Usar `REM` para explicar pasos en scripts por lotes.

## 2. Verificación de Comandos Nx (Protocolo Live-Check)

Debido a la rápida evolución de Nx (v20+), la IA no debe confiar ciegamente en su entrenamiento base.

1.  **🔍 BÚSQUEDA OBLIGATORIA:** Antes de generar un comando complejo de generación (`nx g`), la IA debe consultar internamente la documentación vigente.
2.  **✅ SINTAXIS SEGURA:**
    *   Usar `nx add` para agregar plugins.
    *   Usar `nx g` (generate) para crear librerías o componentes.
    *   Usar flags explícitos: `--dry-run` para previsualizar cambios destructivos.

## 3. Calidad de Código y Linting (Zero-Tolerance)

RazWorks utiliza **ESLint Flat Config** (`eslint.config.mjs`) en la raíz.

*   **Regla de Oro:** El código entregado **NUNCA** debe contener violaciones de linter.
*   **Pre-Entrega:** La IA debe simular mentalmente la validación:
    *   ¿Hay variables no usadas? -> Borrarlas.
    *   ¿Hay tipos `any` explícitos? -> Reemplazarlos por interfaces o `unknown`.
    *   ¿Hay importaciones circulares? -> Refactorizar.
*   **Comando de Verificación:**
    ```cmd
    pnpm nx run-many -t lint
    ```

## 4. Arquitectura de "Aparatos" Modulares (The Apparatus Philosophy)

Definimos un **Aparato** (Librería) como una unidad funcional autocontenida, reutilizable y agnóstica del framework que la consume.

### 4.1. Principios de Diseño
*   **Plug-and-Play:** Un aparato (ej: `libs/whatsapp-engine`) debe poder desconectarse de la API y conectarse a un CLI sin romper su lógica interna.
*   **DRY (Don't Repeat Yourself):** Si una validación se usa en 2 lugares (Frontend y Backend), se abstrae inmediatamente a `@razworks/shared/utils` o `@razworks/dtos`.
*   **SOLID:**
    *   *SRP:* Un archivo, una responsabilidad.
    *   *DIP:* Los módulos de alto nivel dependen de abstracciones (Interfaces en `ports/`), no de implementaciones concretas.

### 4.2. Alias de Rutas (Path Aliases)
El archivo `tsconfig.base.json` es la fuente de verdad. La IA debe usar estos alias y **NUNCA** rutas relativas profundas (`../../`).

| Alias | Ruta Real (`libs/...`) | Descripción y Uso |
| :--- | :--- | :--- |
| `@razworks/core` | `core/src/index.ts` | Lógica de negocio pura y Entidades. |
| `@razworks/dtos` | `shared/dtos/src/index.ts` | Contratos Zod compartidos. |
| `@razworks/ui` | `ui-kit/src/index.ts` | Componentes visuales React (Shadcn). |
| `@razworks/ai` | `ai-system/src/index.ts` | Adaptadores de Inteligencia Artificial. |
| `@razworks/database` | `database/src/index.ts` | Esquemas Drizzle y Clientes. |
| `@razworks/security` | `security/src/index.ts` | Criptografía y Firmas HMAC. |
| `@razworks/testing` | `testing/src/index.ts` | Factories y Mocks para QA. |

## 5. Estándar de Documentación TSDoc (Non-Negotiable)

Cada archivo `.ts` o `.tsx` debe iniciar con un bloque de documentación que otorgue contexto a la IA futura y a los desarrolladores humanos.

```typescript
/**
 * @fileoverview [Descripción breve del propósito del archivo]
 * @module [Namespace, ej: @razworks/ai-core]
 *
 * @author Raz Podestá <raz.podesta@metashark.tech>
 * @copyright 2025 MetaShark Tech.
 * @license UNLICENSED - Proprietary Software.
 *
 * @description
 * [Explicación técnica profunda. Qué patrón implementa, por qué existe
 * y qué dependencias críticas tiene.]
 */
6. Referencia de Comandos Windows/pnpm (Cheat Sheet)
Tabla de conversión obligatoria para la IA:
Acción	Comando Incorrecto (Bash/NPM)	Comando Correcto (Win/PNPM)
Instalar	npm install	pnpm install
DevDep	npm i -D pkg	pnpm add -D pkg
Ejecutar	npm run dev	pnpm run dev
Generar Lib	nx g lib my-lib	pnpm nx g @nx/js:lib libs/my-lib --bundler=tsc
Limpiar	rm -rf dist	rimraf dist (o pnpm nx reset)
Variables	export A=1	set A=1

---


