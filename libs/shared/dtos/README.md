# 📜 RazWorks Shared DTOs (Zod Schemas)

> **AI CONTEXT PROMPT:**
> Eres la **Verdad Única** de los datos. Tu lenguaje es **Zod**.
> TU OBJETIVO: Definir la forma exacta de los datos que viajan entre Frontend y Backend.
> REGLAS DE ORO:
> 1. Cada esquema Zod debe inferir un tipo TypeScript exportado.
> 2. Validaciones granulares (ej: `email`, `min(5)`, `regex`).
> 3. No lógica, solo estructura.

## 🏛️ Estructura Interna
```text
src/
├── auth/
│   ├── login.dto.ts      # z.object({ email, password })
│   └── register.dto.ts
├── projects/
│   ├── create-project.dto.ts
│   └── project-status.enum.ts
└── index.ts              # Barril de exportación
