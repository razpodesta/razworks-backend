/**
 * @fileoverview Contrato de datos para el Encabezado (RazNavbar) del Admin Panel.
 * @module Schemas/Header
 * @description
 * Define la estructura estricta de los textos utilizados en la barra de navegación superior.
 * Incluye claves para elementos de UI (búsqueda, menús) y etiquetas de accesibilidad
 * críticas para lectores de pantalla.
 */

import { z } from 'zod';

export const headerSchema = z.object({
  // --- BÚSQUEDA GLOBAL ---
  search_placeholder: z.string().describe('Texto placeholder para la barra de búsqueda omnisciente (ej: "Buscar en todo el sistema...")'),

  // --- MENÚ DE USUARIO & PERFIL ---
  user_profile: z.string().describe('Etiqueta para el avatar o menú de usuario (ej: "Mi Perfil")'),
  settings: z.string().describe('Enlace directo a configuración del sistema'),
  logout: z.string().describe('Acción de cierre de sesión'),

  // --- NOTIFICACIONES & ESTADO ---
  notifications: z.string().describe('Aria-label para el botón de notificaciones (ej: "Ver notificaciones")'),
  notifications_empty: z.string().describe('Mensaje cuando no hay alertas nuevas'),

  // --- ACCESIBILIDAD & UTILIDADES ---
  theme_toggle_label: z.string().describe('Aria-label para el interruptor de tema (Claro/Oscuro)'),
  language_selector: z.string().describe('Aria-label para el selector de idioma'),

  // --- BRANDING MÓVIL ---
  mobile_menu_toggle: z.string().describe('Aria-label para abrir/cerrar el menú en móviles'),
});

// Inferencia de tipos para uso en componentes React
export type HeaderDictionary = z.infer<typeof headerSchema>;
