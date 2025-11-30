<!--
  @id ARCH-005-COMMUNICATION
  @type ARCHITECTURE
  @status MANDATORY
  @title ESTRATEGIA DE ENLACE FRONTEND-BACKEND (BFF PATTERN)
-->

# 🌉 ESTRATEGIA DE COMUNICACIÓN: THE SECURE BRIDGE

## 1. Filosofía: "Backend For Frontend" (BFF) Virtual
Aunque usamos Next.js (Fullstack), trataremos la capa de servidor de Next.js (`Server Components` y `Route Handlers`) como un **Proxy Seguro** hacia nuestra API NestJS principal.

### El Flujo de Datos Soberano
1.  **Usuario (Browser)** -> Interactúa con UI.
2.  **Next.js Server (Vercel)** -> Intercepta la petición, inyecta secretos/tokens.
3.  **NestJS API (Render)** -> Recibe petición validada, ejecuta lógica, toca DB.
4.  **Supabase (AWS)** -> Entrega datos crudos al Backend.

## 2. Tecnologías de Transporte

### A. Server Actions (Mutaciones)
Para escribir datos (POST/PUT/DELETE), usamos **Next.js Server Actions**.
*   **Ventaja:** El token de autenticación nunca se expone en el `body` de la petición cliente, se maneja en la capa de servidor de Vercel.
*   **Seguridad:** Validación Zod doble (en Server Action y en NestJS Pipe).

### B. Fetch Data (Lecturas)
*   **RSC (React Server Components):** Fetch directo a NestJS.
    *   *Cache:* Uso de `fetch('...', { next: { tags: ['projects'] } })` para caché granular.
*   **TanStack Query (Cliente):** Solo para datos en tiempo real o polling (ej: Estado del Servidor).

## 3. Optimización de Performance (Render vs Vercel)
Dado que los servidores están separados:
1.  **Keep-Alive:** El agente HTTP en Next.js debe mantener conexiones TCP abiertas (`keepAlive: true`) para evitar el *handshake* SSL en cada petición.
2.  **Payload Minification:** NestJS debe responder con DTOs serializados, eliminando campos innecesarios antes de enviar a Vercel.
3.  **Compresión:** Brotli/Gzip obligatorio en la respuesta de NestJS.

## 4. Seguridad de Tránsito (Encryption Manifest)
Toda comunicación entre Vercel y Render viaja por **TLS 1.3**.
Adicionalmente, para datos críticos (Pagos, PII), se aplica **JWE (JSON Web Encryption)** a nivel de aplicación (ver `libs/security`).

---
