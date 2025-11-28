<!--
  @fileoverview Manifiesto de Calidad, Estrategia de Pruebas y QA Automatizado
  @module Infrastructure/Quality

  @author Raz Podestá <raz.podesta@metashark.tech>
  @copyright 2025 MetaShark Tech - Florianópolis, SC. All rights reserved.
  @license UNLICENSED - Proprietary Software.

  @description
  Documento rector que define la estrategia de pruebas "Mirror Route", la obligatoriedad
  del idioma Portugués-BR en los reportes y la arquitectura de Factories centralizadas.

  @requires Jest
  @requires Playwright
  @requires @faker-js/faker
  @version 1.0.0
-->

# 🧪 MANIFIESTO DE CALIDAD Y PRUEBAS (QA DIRECTIVE)

## 1. Principio Fundamental: "Zero Bugs Policy"
En RazWorks, el código sin pruebas no existe. La calidad no es un acto final, es un hábito continuo. Todo Pull Request debe incluir pruebas que cubran escenarios "Happy Path", "Edge Cases" y "Error Handling".

## 2. Directiva de Idioma (Localización QA)
*   **Mandatorio:** Toda descripción de prueba (`describe`, `it`, `test`) y todo mensaje de error personalizado debe estar redactado en **Português do Brasil (pt-BR)**.
*   **Objetivo:** Facilitar la lectura semántica y la alineación con el equipo de LATAM/Brasil.

**Ejemplo Correcto:**
```typescript
describe('Fluxo de Criação de Projeto', () => {
  it('deve rejeitar o projeto se o orçamento for menor que o mínimo permitido', async () => {
    // ...
  });
});
3. Arquitectura de "Ruta Espejo" (Mirror Route Strategy)
Las pruebas NO residirán dentro de las carpetas de la aplicación (src). Se ubicarán en un directorio raíz tests/ que replicará exactamente la estructura del monorepo.
3.1. Árbol de Directorios
code
Text
razworks/
├── apps/
│   ├── api/src/modules/auth/auth.service.ts
│   └── web-client/app/page.tsx
├── libs/
│   └── shared-dtos/src/lib/project.dto.ts
└── tests/ (ROOT)
    ├── apps/
    │   ├── api/src/modules/auth/auth.service.spec.ts  <-- Unit Test Espejo
    │   └── web-client/e2e/login.spec.ts               <-- E2E Test
    └── libs/
        └── shared-dtos/src/lib/project.dto.spec.ts    <-- Unit Test Espejo
3.2. Configuración Técnica
Los archivos jest.config.ts y tsconfig.spec.json deben configurarse para mapear tests/apps/api como la raíz de búsqueda de pruebas para el proyecto api.

4. Tipología y Granularidad
Nuestro sistema de pruebas es piramidal y exhaustivo.

4.1. Pruebas Unitarias (Backend & Libs)
Tecnología: Jest.
Alcance: Funciones puras, Servicios y DTOs.
Regla: Mockear absolutamente todas las dependencias externas (DB, Redis, API IA).
Ubicación: tests/apps/.../unit/ o espejo directo.

4.2. Pruebas de Integración (Backend)
Tecnología: Jest + Supertest (o Fastify Inject).
Alcance: Controladores + Servicios + Base de Datos (en memoria o Docker efímero).
Regla: Verificar que los módulos se hablen entre sí correctamente.
Ubicación: tests/apps/api/integration/.

4.3. Pruebas End-to-End (Frontend & Flujos Completos)
Tecnología: Playwright.
Alcance: Simulación de usuario real (navegador) recorriendo el sitio.
Regla: Probar flujos críticos (Registro -> Publicar Proyecto -> Recibir Propuesta).
Ubicación: tests/apps/web-client/e2e/.

5. La "Granja de Mocks" (Factories Centralizadas)
Prohibido crear objetos de prueba "hardcoded" en cada archivo .spec.ts. Se usará el patrón Object Mother / Factory.
Librería: @faker-js/faker (para datos aleatorios realistas en pt-BR).
Ubicación: libs/testing/src/factories.
Ejemplo de Uso:

// En el test
import { UserFactory } from '@razworks/testing';

const usuarioBrasileiro = UserFactory.createFreelancer({
  nivel: 'Tubarão',
  localizacao: 'Florianópolis'
});

6. Reportes y Descriptibilidad
La salida de la consola debe contar una historia.
Reporter: Configurar Jest/Playwright para usar reporteros detallados.
Fallo: Si una prueba falla, el mensaje debe explicar POR QUÉ falló el negocio, no solo el error técnico.
❌ Error: Expected true to be false.
✅ Falha: O sistema permitiu cadastro de usuário sem email válido, esperava-se exceção 'EmailInvalido'.

---


