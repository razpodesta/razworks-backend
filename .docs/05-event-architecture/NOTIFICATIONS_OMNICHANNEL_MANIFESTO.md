<!--
  @title MANIFIESTO DEL SISTEMA DE NOTIFICACIONES OMNICANAL
  @id DOC-005-NOTIFICATIONS
  @category Architecture/Events
  @status LAW (Inmutable)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 🔔 APARATO V-B: LA TORRE DE SUSURROS (NOTIFICATIONS SYSTEM)

## 1. Visión: "Signal over Noise"
El sistema de notificaciones no es un chat. Es un **Semáforo de Estado**.
*   **Propósito:** Alertar al usuario (Cliente o Razter) sobre cambios de estado críticos que requieren atención inmediata.
*   **Principio de "Zero-Payload Persistence":** No guardamos el texto de la notificación ("Hola Juan, tu proyecto ha sido aprobado"). Guardamos **Metadatos Semánticos**.

## 2. Arquitectura de Datos Eficiente

### A. La Estructura "Skeleton"
Para ahorrar Gigabytes en base de datos, usamos referencias a diccionarios.
*   **Tabla:** `notifications`.
*   **Columna `action_id`:** Referencia numérica (`smallint`) a `dic_action_codes`.
*   **Columna `metadata`:** JSONB ligero (`{ "project_title": "Omega", "amount": 500 }`).
*   **Renderizado:** El Frontend reconstruye el texto usando i18n (`t('actions.PROJ_APPROVED', metadata)`).

### B. El Ciclo de Vida del Estado
1.  **UNREAD (Pendiente):** El semáforo está en ROJO.
2.  **READ (Visto):** El usuario abrió el panel. El semáforo pasa a VERDE.
3.  **ARCHIVED (Histórico):** El usuario descartó la alerta. Se mueve a "Cold Storage" lógico.
4.  **DELETED (Purga):** Soft-delete real.

## 3. Estrategia de Tiempo Real Híbrida

1.  **Ingesta (BullMQ):** Los eventos del sistema (`ProjectCreated`) entran a una cola `notifications-queue`.
2.  **Procesamiento:** Un Worker valida preferencias de usuario y escribe en DB.
3.  **Señalización (Redis):** Se incrementa un contador atómico en Redis (`users:{id}:unread_count`).
4.  **Entrega:** El cliente consulta este contador (Polling ligero o SSE) para encender la "Campanita Roja" sin hacer query pesada a DB.

## 4. Seguridad y Privacidad
*   **Aislamiento:** Un usuario SOLO puede ver notificaciones donde `user_id` coincida con su Token.
*   **Sanitización:** Los metadatos nunca deben contener PII sensible sin encriptar.

---

