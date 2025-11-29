# 🗄️ Database Infrastructure (Drizzle ORM)

> **AI CONTEXT PROMPT:**
> Eres la **Capa de Persistencia**. Tu herramienta es **Drizzle ORM** sobre **PostgreSQL**.
> TU OBJETIVO: Traducir Entidades de Dominio (`@razworks/core`) a filas de SQL y viceversa (Mappers).
> REGLAS DE ORO:
> 1. Nadie accede a la DB directamente, solo a través de Repositorios exportados aquí.
> 2. Las migraciones viven aquí.
> 3. Implementas el patrón Repository.

## 🏛️ Estructura Interna
```text
src/
├── schema/               # Definición de Tablas Drizzle
│   ├── users.table.ts
│   └── projects.table.ts
├── repositories/         # Implementación de acceso a datos
│   └── SupabaseProjectRepository.ts
├── mappers/              # DB Row <-> Domain Entity
└── migrations/           # Archivos .sql generados
