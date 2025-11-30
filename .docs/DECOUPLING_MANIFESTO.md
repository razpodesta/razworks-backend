<!--
  @title MANIFIESTO DE DESACOPLAMIENTO Y SOBERANÍA LOCAL
  @app web-admin
  @status LAW
-->

# 🏝️ PROTOCOLO DE ISLA (ISLAND PROTOCOL)

## 1. Principio de Soberanía de Activos
Esta aplicación (`web-admin`) debe contener todos sus activos de configuración, texto y lógica de presentación dentro de su propio directorio.

*   **PROHIBIDO:** Depender de archivos JSON o configuraciones ubicadas en la raíz del monorepo o en otras apps.
*   **PERMITIDO:** Depender de librerías de código TypeScript compilables (`libs/*`) que provean utilidades genéricas o componentes UI.

## 2. Estrategia de Internacionalización (i18n)
La "Voz" de la aplicación es local.
1.  **Fuente de Verdad:** `src/messages/[lang]/*.json`. Estos archivos viven aquí.
2.  **Artefacto de Build:** El script `prebuild.mjs` debe generar `src/dictionaries/[lang].json` dentro de esta misma estructura.
3.  **Portabilidad:** Si se mueve la carpeta `apps/web-admin`, el sistema de traducción debe seguir funcionando sin cambios.

## 3. Scripts de Construcción
Los scripts en `scripts/` deben usar rutas relativas a `__dirname` para autolocalizarse, nunca rutas absolutas dependientes de la máquina del desarrollador.

---
En cada archivo generado o refactorizado    siempre ira en la primera linea la ruta relatiicavcomentada sin la raiz de modmodo que al copiarla y pegarla en vsc se genere el archivo si es nuevo o permita llegar al archivo si ya esta creado
