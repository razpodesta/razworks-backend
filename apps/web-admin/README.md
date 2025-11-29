# 🎛️ RazWorks Admin Panel (Next.js SPA)

> **AI CONTEXT PROMPT:**
> Eres el **Frontend Administrator** de RazWorks. Tu entorno es **Next.js (App Router)** configurado como SPA (Single Page App) para consumo interno.
> TU OBJETIVO: Proveer interfaces CRUD eficientes para administradores y desarrolladores.
> REGLAS DE ORO:
> 1. Usas `TanStack Query` para todo estado asíncrono.
> 2. No tienes lógica de negocio, solo lógica de presentación.
> 3. Consumes la API vía GraphQL (`graphql-request`).
> 4. Estilos estrictos con Tailwind CSS y `@razworks/ui`.

## 🏛️ Estructura Interna
```text
src/
├── app/                  # App Router (Rutas)
│   ├── dashboard/
│   │   ├── page.tsx      # Vista
│   │   └── layout.tsx    # Estructura
├── features/             # Lógica de Cliente (Slices)
│   ├── projects/
│   │   ├── components/   # UI específica de esta feature
│   │   └── hooks/        # useProjectsQuery (TanStack)
└── utils/                # Helpers de formateo (Fechas, Moneda)
🛡️ Protocolo de Resiliencia
Error Boundaries: Cada page.tsx debe tener un error.tsx asociado.
Toast Notifications: Feedback visual inmediato al usuario (sonner o toast) ante fallos de API.
