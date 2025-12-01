<!--
  @title PROTOCOLO DE INDEPENDENCIA DEL WORKSPACE FRONTEND
  @id DOC-006-INDEPENDENCE
  @category Architecture/Frontend
  @status LAW (Inmutable)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 🏝️ PROTOCOLO DE LA ISLA SOBERANA (FRONTEND DECOUPLING)

## 1. Visión Estratégica: "Deploy Anywhere, Anytime"
El espacio de trabajo `apps/web-admin` no es un simple consumidor del monorepo. Es una **Entidad Soberana** diseñada para ser extraída físicamente del repositorio principal sin romper su lógica de compilación.

*   **Objetivo:** Permitir despliegues en Vercel/Netlify tratando la carpeta `apps/web-admin` como la *Root Directory*, sin necesidad de subir el código del Backend (`apps/api`) ni las librerías de infraestructura pesada (`libs/database`, `libs/ai-system`).

## 2. La Ley de la Colocalización (Location Law)

Cualquier nuevo activo digital que pertenezca a la experiencia visual o interactiva del usuario **DEBE** nacer y vivir dentro de `apps/web-admin`.

### ❌ PROHIBIDO (The Forbidden Zone)
Está estrictamente prohibido crear librerías en la raíz `libs/` para:
1.  **Componentes de UI:** Nada de `libs/buttons`, `libs/modals`. Todo va a `apps/web-admin/src/components/ui`.
2.  **Hooks de React:** Nada de `libs/react-hooks`. Todo va a `apps/web-admin/src/lib/hooks`.
3.  **Utilidades de Browser:** Si usa `window`, `document` o `localStorage`, vive en la App.

### ✅ MANDATORIO (The Sovereign Structure)
Toda nueva funcionalidad debe seguir esta topología interna:

```text
apps/web-admin/src/
├── components/
│   ├── ui/           # Átomos genéricos (Avatar, Button, Input)
│   └── features/     # Organismos de negocio (UserCard, ProjectList)
├── lib/
│   ├── hooks/        # Lógica de estado (useScroll, useAuth)
│   ├── utils/        # Helpers puros (cn, formatMoney)
│   └── stores/       # Estado global (Zustand)
└── styles/           # Configuración CSS/Tailwind
3. Gestión de Dependencias (Package.json Autonomy)
El package.json de la raíz del monorepo es para herramientas de orquestación (Nx, Eslint).
El package.json de apps/web-admin es la Fuente de Verdad para la UI.
Regla: Si instalas una librería de UI (ej: framer-motion, lucide-react, chart.js), DEBES instalarla en el package.json de la aplicación, no en el raíz.
Comando: cd apps/web-admin && pnpm add [librería].
4. Fronteras de Importación (The Import Wall)
⛔ Imports Bloqueados
El Frontend NUNCA debe importar de:
@razworks/core (Lógica de servidor).
@razworks/database (Acceso a DB directo).
@razworks/notifications (Lógica backend de alertas).
Cualquier librería que dependa de node:fs, node:crypto o secretos de entorno (process.env.DB_PASS).
⚠️ Imports Tolerados (Shared Contracts)
Hasta la separación física total, se permite importar SOLO CONTRATOS (Tipos) que no contengan lógica de ejecución.
@razworks/dtos (Zod Schemas): Permitido para validación de formularios y tipado de API.
Nota: Al momento del desacople físico, estos DTOs deberán copiarse a apps/web-admin/src/lib/dtos o publicarse como paquete NPM privado.
5. Instrucciones para la IA (Generative Constraints)
TÚ (La IA) DEBES:
Verificar Contexto: Antes de crear un archivo .tsx, asegúrate de que la ruta comience con apps/web-admin/. Si intentas crearlo en libs/, DETENTE y corrige la ruta.
Utilidades Locales: Al generar componentes, usa siempre import { cn } from '@/lib/utils', nunca importes utilidades de librerías externas.
Refactorización Preventiva: Si el usuario pide "Crear una librería de componentes", tu respuesta debe ser: "Según el Protocolo de Independencia, crearé estos componentes dentro de la carpeta src/components de la aplicación web para mantener el desacople."

---

