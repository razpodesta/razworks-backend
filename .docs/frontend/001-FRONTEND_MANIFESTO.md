<!--
  @id FE-001-MANIFESTO
  @module Frontend/Architecture
  @status ACTIVE - LAW
  @app web-admin
  @author Raz Podestá & LIA Legacy
-->

# 🖥️ RAZWORKS FRONTEND: MANIFIESTO DE ARQUITECTURA

**Aplicación:** `apps/web-admin`
**Propósito:** Centro de Comando y Control (C2) del ecosistema RazWorks.

---

## 1. Visión y Propósito
Esta aplicación **NO** es un sitio público de marketing. Es una **SPA (Single Page Application)** híbrida renderizada por servidor (Next.js), diseñada para la administración de sistemas, gestión de CMS y visualización de métricas en tiempo real.
*   **Prioridad:** Funcionalidad, Densidad de Información y Velocidad.
*   **Estética:** "Industrial Tech". Minimalista, oscura por defecto, semántica.

---

## 2. Stack Tecnológico Soberano

### A. El Motor (Core)
*   **Framework:** **Next.js 15 (App Router)**. Usamos Server Components (`RSC`) por defecto para reducir el bundle de cliente. Los componentes interactivos (`'use client'`) se usan solo en las hojas del árbol (botones, formularios).
*   **Lenguaje:** **TypeScript 5.x** en modo estricto.
*   **Gestor de Paquetes:** **pnpm** (Hard constraint).

### B. Estilizado y Theming (Semantic System)
*   **Motor:** **Tailwind CSS**.
*   **Abstracción:** No usamos colores Hex (`#000`) arbitrarios. Usamos **Tokens Semánticos** definidos en `global.css`:
    *   `bg-background` / `text-foreground`: Base de la página.
    *   `bg-card` / `border-border`: Contenedores.
    *   `bg-primary` / `text-primary-foreground`: Acciones principales.
*   **Modo Oscuro:** Gestionado por `next-themes`. La clase `.dark` se inyecta en el `<html>`. El sistema debe soportar cambio instantáneo sin *fouc* (flash of unstyled content).

### C. Soberanía de Tipos (Zod as Truth)
En RazWorks, **no escribimos interfaces de TypeScript manualmente** para los datos de entrada/salida.
1.  Definimos un **Schema Zod** en `libs/shared/dtos` o `src/lib/schemas`.
2.  Inferimos el tipo: `type User = z.infer<typeof UserSchema>`.
3.  Esto garantiza que la validación en tiempo de ejecución (formularios/API) y el tipado estático estén siempre sincronizados al 100%.

---

## 3. Estrategia de Internacionalización (i18n Nativa)

El sistema es global desde el día 1. No usamos librerías pesadas de traducción en cliente si podemos evitarlo.

### La Arquitectura `[lang]`
1.  **Enrutamiento:** Toda ruta vive bajo `app/[lang]/...`. El middleware detecta el idioma y redirige.
2.  **Diccionarios:** Los textos viven en `src/dictionaries/*.json`.
3.  **Carga:** En Server Components, cargamos el diccionario completo o parcial (`getDictionary(lang)`) y lo pasamos como prop a los componentes de cliente ("Prop Drilling" controlado o Contexto si es muy profundo).
4.  **Inmutabilidad:** El idioma por defecto es `pt-BR` (Português Brasileiro), con soporte para `en-US` y `es-ES`.

---

## 4. Patrones de Diseño de UI

### A. Componentes "Dumb" (UI Kit)
Viven en `src/components/ui`. Son puramente visuales. Reciben datos vía props. No hacen fetch.
*   *Ejemplo:* `StatusBadge`, `Button`, `Card`.

### B. Componentes "Smart" (Features)
Viven en `src/components/features` (o carpetas específicas). Conectan con stores (Zustand) o APIs.
*   *Ejemplo:* `ProjectList` (hace fetch), `UserProfile` (lee cookie).

### C. Layouts Persistentes
El `Navbar` y `Sidebar` mantienen su estado entre navegaciones. Usamos layouts anidados de Next.js para evitar re-renders costosos de la estructura marco.

---

## 5. Gestión de Estado (Zustand)
Para el estado global de UI (ej: ¿Está abierto el menú lateral? ¿Cuál es el tema activo?), usamos **Zustand** con persistencia en `localStorage`.
*   **Regla:** Evitar `Context API` para estados que cambian frecuentemente para prevenir re-renders masivos.

---

## 6. Flujo de Datos (Server Actions & API)
1.  **Lectura (GET):** Preferimos fetch directo en Server Components.
2.  **Escritura (POST/PUT):** Usamos **Server Actions** de Next.js para mutaciones, aprovechando la revalidación de caché (`revalidatePath`).

---

**FIN DEL MANIFIESTO.**
