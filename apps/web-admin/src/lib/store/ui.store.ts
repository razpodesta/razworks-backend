// RUTA: apps/web-admin/src/lib/store/ui.store.ts
// VERSIÓN: 1.0 - Store de UI Soberano
// DESCRIPCIÓN: Gestión de estado global para la interfaz de usuario utilizando Zustand.
//              Implementa persistencia automática para preferencias de usuario.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Contrato de Estado (Interface)
// Define estrictamente qué datos y acciones están disponibles.
interface UIState {
  // --- Estado del Visitor HUD ---
  isVisitorHudOpen: boolean;
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;

  // --- Estado del Menú Móvil (Preparado para expansión) ---
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

// 2. Implementación del Store
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // --- Lógica Visitor HUD ---
      isVisitorHudOpen: true, // Valor inicial por defecto

      toggleVisitorHud: () =>
        set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),

      closeVisitorHud: () => set({ isVisitorHudOpen: false }),

      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      // --- Lógica Menú Móvil ---
      isMobileMenuOpen: false,

      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'portfolio-ui-preferences', // Clave única en localStorage
      storage: createJSONStorage(() => localStorage), // Motor de persistencia

      // 3. Configuración de Persistencia Parcial
      // Solo persistimos 'isVisitorHudOpen'. El menú móvil siempre debe empezar cerrado.
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen
      }),
    }
  )
);
