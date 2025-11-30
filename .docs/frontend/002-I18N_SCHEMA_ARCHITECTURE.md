<!--
  @id FE-002-I18N-ARCH
  @module Frontend/i18n
  @status ACTIVE
  @related scripts/prebuild-web-admin.mjs
-->

# 🌐 ARQUITECTURA DE DICCIONARIOS ATÓMICOS & ENSAMBLAJE

## 1. Filosofía: Atomicidad sobre Monolito
En lugar de mantener archivos JSON gigantes (`en-US.json` de 5000 líneas), dividimos el contenido en archivos **atómicos** por componente o dominio funcional.

### Flujo de Datos
1.  **Entrada (Source):** `src/messages/[lang]/*.json` (Archivos pequeños: `header.json`, `sidebar.json`).
2.  **Proceso (Build):** El script `prebuild-web-admin.mjs` lee estos archivos y los fusiona.
3.  **Salida (Artifact):** `src/dictionaries/[lang].json` (El archivo monolítico que consume la app).
4.  **Validación:** `dictionary.schema.ts` valida la **Salida** para asegurar que no falten claves.

## 2. Estructura de Carpetas

```text
src/
├── messages/           # EDITAR AQUÍ (Fuente)
│   ├── en-US/
│   │   ├── dashboard.json
│   │   ├── sidebar.json
│   │   └── ...
│   └── ...
├── dictionaries/       # NO EDITAR (Generado)
│   ├── en-US.json      # Artifact generado
│   └── ...
└── lib/schemas/        # CONTRATOS
    ├── dictionary.schema.ts  # Valida el JSON final
    └── dashboard.schema.ts   # Schema atómico
3. Ciclo de Desarrollo
Para agregar texto:
Crear/Editar src/messages/[lang]/nuevo-modulo.json.
Actualizar dictionary.schema.ts para incluir la nueva clave.
Correr pnpm run prebuild.


---
