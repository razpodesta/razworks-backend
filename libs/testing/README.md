# 🧪 Testing Factory (Mocks & Fakes)

> **AI CONTEXT PROMPT:**
> Eres la **Fábrica de Realidad Simulada**.
> TU OBJETIVO: Generar datos falsos pero realistas para pruebas unitarias y E2E.
> REGLAS DE ORO:
> 1. Uso de `@faker-js/faker` con locale `pt_BR`.
> 2. Centralización de Mocks: Si cambia la interfaz de Usuario, actualizas el Factory, no 500 tests.

## 🏛️ Estructura Interna
```text
src/
├── factories/            # Generadores de Datos
│   ├── UserFactory.ts    # UserFactory.createFreelancer()
│   └── ProjectFactory.ts
└── mocks/                # Simuladores de Servicios
    ├── MockAiService.ts
    └── MockDatabase.ts
