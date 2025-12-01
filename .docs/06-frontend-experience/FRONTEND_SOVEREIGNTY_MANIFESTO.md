<!--
  @title MANIFIESTO DE LA INTERFAZ SOBERANA Y EXPERIENCIA DE USUARIO
  @id DOC-006-FRONTEND-EXP
  @category Architecture/Frontend
  @status LAW (Inmutable)
  @version 3.0.0 (Consolidated)
  @author Raz Podestá & LIA Legacy
-->

# 🖥️ APARATO VI: LA INTERFAZ SOBERANA (FRONTEND EXPERIENCE)

## 1. Visión y Filosofía: "La Isla Conectada"
La aplicación Frontend (`apps/web-admin`) es una entidad soberana. Debe ser capaz de construirse y desplegarse en Vercel sin requerir que el Backend (NestJS) esté presente en el mismo sistema de archivos.

*   **Principio de "Dumb UI, Smart Server":** El cliente (Navegador) solo renderiza y captura eventos. La lógica pesada vive en los *Server Components* o *Server Actions*.
*   **Principio de Estética Industrial:** Diseño "Tech-Noir" minimalista, alta densidad de información, oscuro por defecto.

## 2. Stack Tecnológico Soberano

### A. El Motor (Next.js App Router)
*   **RSC (React Server Components):** Son el estándar por defecto. Reducen el bundle de JS al cliente.
*   **Client Components (`'use client'`):** Se usan **SOLO** en las hojas del árbol de componentes donde se requiere interactividad (onClick, useState, useEffect).

### B. Sistema de Diseño (Atomic UI Kit)
Centralizado en `libs/ui-kit`.
*   **Tecnología:** Shadcn/UI + Tailwind CSS v4.
*   **Regla de Atomicidad:** Los componentes de UI (`Button`, `Card`) son puros y sin estado de negocio. Reciben datos vía `props`.
*   **Tokens Semánticos:** No usamos colores Hex (`#000`). Usamos variables CSS (`bg-background`, `text-primary`) para soportar temas sin esfuerzo.

## 3. Estrategia de Comunicación (Consumiendo el BFF)

El Frontend nunca debe conocer los secretos de la API.

1.  **Lectura (GET):** Se realiza en **Server Components** usando `fetch` directo a la API.
    *   *Seguridad:* Al ser servidor-servidor, es seguro.
2.  **Escritura (POST/PUT):** Se realiza a través de **Server Actions**.
    *   *El Muro:* El componente de Cliente llama a la Server Action (`actions/system.actions.ts`). La Server Action firma la petición (HMAC) y llama a la API.
    *   **PROHIBIDO:** Importar `axios` o hacer `fetch` directo a la API de Backend desde un componente con `'use client'`.

## 4. Internacionalización (i18n) Nativa y Atómica
(Absorbido de Protocolo 002)

El sistema es global desde el primer byte.

1.  **Arquitectura `[lang]`:** Toda ruta vive bajo `app/[lang]/...`. El middleware gestiona la detección y redirección.
2.  **Diccionarios Atómicos:**
    *   *Fuente:* Archivos JSON pequeños en `src/messages/[lang]/*.json` (ej: `header.json`, `auth.json`).
    *   *Build:* Un script de pre-construcción fusiona estos átomos en un diccionario maestro para rendimiento.
3.  **Tipado Estricto:** TypeScript valida que las claves usadas en los componentes (`t.header.title`) existan realmente en el JSON.

## 5. Gestión de Estado (State Sovereignty)

No todo el estado es igual. Usamos la herramienta correcta para cada tipo:

*   **Server State (Datos):** React Server Components (Fetch directo) + Revalidación de Caché (`revalidateTag`). *No usamos Redux/Zustand para datos de la API.*
*   **Client State (UI):** Zustand. Solo para estado efímero de interfaz global (ej: "¿El sidebar está abierto?", "¿El modal de cookies se cerró?").
*   **URL State:** El estado navegable (Filtros, Paginación, Búsqueda) **DEBE** vivir en la URL (`?page=2&q=react`) para permitir compartir enlaces.

## 6. Instrucciones para la IA (Frontend Rules)

**TÚ (La IA) DEBES:**

1.  **Proteger el Bundle:** Antes de importar una librería pesada (ej: `crypto`, `fs`), verifica si estás en un archivo `'use client'`. Si es así, **DETENTE**. Eso romperá el build.
2.  **Mobile First:** Todas las clases de Tailwind deben escribirse pensando en móvil primero (`w-full md:w-1/2`).
3.  **Accesibilidad (a11y):** Nunca generes un `button` sin `aria-label` si solo contiene un ícono. Nunca generes una `img` sin `alt`.

## 7. Estructura de Directorios (`apps/web-admin`)

```text
src/
├── app/
│   ├── [lang]/             # Rutas localizadas
│   │   ├── layout.tsx      # Layout raíz (Html/Body)
│   │   └── page.tsx        # Server Component
│   ├── actions/            # Server Actions (BFF Virtual)
│   └── api/                # Route Handlers (Webhooks, Proxy)
├── components/
│   ├── ui/                 # Componentes tontos (Importados de ui-kit o locales)
│   └── features/           # Componentes inteligentes (Conectados a negocio)
├── lib/
│   ├── schemas/            # Definiciones Zod de UI
│   └── utils/              # Helpers puros
├── messages/               # JSONs de traducción (Fuente)
└── dictionaries/           # JSONs compilados (Generados - No editar)

---

<!--
  @title MANIFIESTO DE LA INTERFAZ SOBERANA (FRONTEND ARCHITECTURE)
  @id DOC-006-FRONTEND-EXP
  @category Architecture/Frontend
  @status LAW (Inmutable)
  @version 4.0.0 (Adapted & Enhanced)
  @author Raz Podestá & LIA Legacy
-->

# 🖥️ APARATO VI: LA INTERFAZ SOBERANA (FRONTEND EXPERIENCE)

## 1. Visión y Propósito: "La Isla Conectada"
La aplicación `apps/web-admin` no es un sitio web pasivo. Es el **Centro de Comando y Control (C2)** del ecosistema RazWorks.

*   **Soberanía de Despliegue:** El Frontend es una entidad autónoma. Se construye y despliega en Vercel sin requerir que el código del Backend (NestJS) exista en el mismo sistema de archivos.
*   **Filosofía:** "Dumb UI, Smart Server". El navegador solo renderiza y captura intenciones. La lógica pesada vive en *Server Components* o se delega al Backend vía *Virtual BFF*.
*   **Estética:** "Industrial Tech". Minimalista, alta densidad de datos, oscura por defecto (`.dark`).

## 2. Stack Tecnológico Soberano

### A. El Motor (Next.js 15 App Router)
*   **RSC (React Server Components):** Estándar por defecto.
    *   *Beneficio:* Reducción drástica de JS en el cliente.
    *   *Uso:* Fetch de datos, Layouts, Páginas estáticas.
*   **Client Components (`'use client'`):**
    *   *Restricción:* Solo en las hojas del árbol (Botones, Formularios interactivos, Hooks).

### B. Sistema de Diseño (Atomic UI Kit)
Centralizado en `libs/ui-kit`.
*   **Tecnología:** Shadcn/UI + Tailwind CSS v4.
*   **Tokens Semánticos:** Prohibido usar colores Hex arbitrarios (`#000`).
    *   ✅ Usar: `bg-background`, `text-primary`, `border-destructive`.
    *   *Por qué:* Garantiza soporte de temas (Dark/Light/High-Contrast) sin refactorización.

### C. Soberanía de Tipos (Zod as Truth)
El Frontend no "inventa" interfaces.
1.  Importa esquemas desde `libs/shared/dtos`.
2.  Infiere el tipo: `type User = z.infer<typeof UserSchema>`.
3.  **Resultado:** Sincronización matemática entre Validación de Formularios y API.

## 3. Estrategia de Comunicación: El Patrón "Virtual BFF"

El Frontend actúa como un Proxy Seguro hacia la API Core (Render).

### A. Lectura (GET) -> Server Components
*   Fetch directo a la API desde el servidor de Next.js.
*   Uso de `fetch('...', { next: { tags: ['projects'] } })` para caché granular.

### B. Escritura (POST/PUT) -> Server Actions
*   **El Muro:** El componente de Cliente **NUNCA** llama a la API directamente.
*   **El Puente:** Llama a un Server Action (`actions/system.actions.ts`).
*   **La Seguridad:** El Server Action recupera `SIGNING_SECRET` (invisible para el cliente), firma la petición (HMAC) y la envía al Backend.

## 4. Estrategia de Internacionalización (i18n Nativa)

El sistema es global desde el primer byte.

1.  **Enrutamiento:** `app/[lang]/...`. El middleware protege la localización.
2.  **Diccionarios Atómicos:**
    *   *Fuente:* `src/messages/[lang]/*.json` (Archivos pequeños y mantenibles).
    *   *Build:* Script `prebuild` fusiona los átomos en un diccionario maestro.
3.  **Inmutabilidad:** Idioma base: `pt-BR` (Português Brasileiro).

## 5. Gestión de Estado (State Sovereignty)

No todo el estado es igual. Usamos la herramienta correcta para cada tipo:

### A. Server State (Datos de Negocio)
*   **Herramienta:** React Server Components + `revalidatePath`.
*   **Regla:** No usar Redux/Zustand para datos que ya viven en la DB.

### B. Client State (UI Efímera)
*   **Herramienta:** **Zustand** (con persistencia en `localStorage`).
*   **Uso:** Estado global de interfaz (Sidebar colapsado, Preferencia de Tema, Modales abiertos).
*   **Regla:** Evitar `Context API` para estados de alta frecuencia para prevenir re-renders masivos.

### C. URL State (Navegabilidad)
*   **Herramienta:** `searchParams`.
*   **Uso:** Filtros, Paginación, Búsqueda. Permite compartir la URL exacta.

## 6. Patrones de Diseño de UI

### A. Componentes "Dumb" (UI Kit)
Viven en `components/ui`. Son puramente visuales.
*   Reciben datos vía `props`.
*   Emiten eventos vía callbacks (`onAction`).
*   No saben qué es una "API".

### B. Componentes "Smart" (Features)
Viven en `components/features`. Conectan los cables.
*   Consumen `useParams`, `useRouter`, `useStore`.
*   Invocan Server Actions.

## 7. Instrucciones para la IA (Frontend Rules)

**TÚ (La IA) DEBES:**

1.  **Proteger el Bundle:** Antes de importar una librería (ej: `crypto`, `fs`), verifica si estás en un archivo `'use client'`. Si es así, **DETENTE**.
2.  **Mobile First:** Tailwind siempre base primero, luego breakpoints (`w-full md:w-1/2`).
3.  **Accesibilidad:** Nunca generar `<img>` sin `alt` ni botones solo-icono sin `aria-label`.

---

