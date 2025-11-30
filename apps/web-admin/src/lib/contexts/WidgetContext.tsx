// RUTA: apps/web-admin/src/lib/contexts/WidgetContext.tsx
// DESCRIPCIÓN: Provee un estado compartido para la visibilidad de los widgets globales.

'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const WIDGET_VISIBLE_KEY = 'visitorWidgetVisible';

interface WidgetContextType {
  isWidgetVisible: boolean;
  toggleWidgetVisibility: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [isWidgetVisible, setIsWidgetVisible] = useState(true); // Visible por defecto

  // Al cargar, lee el estado de visibilidad desde localStorage
  useEffect(() => {
    const storedVisibility = localStorage.getItem(WIDGET_VISIBLE_KEY);
    // Si está guardado como 'false', lo ocultamos. En cualquier otro caso, lo mostramos.
    if (storedVisibility === 'false') {
      setIsWidgetVisible(false);
    }
  }, []);

  const toggleWidgetVisibility = () => {
    setIsWidgetVisible(prev => {
      const newVisibility = !prev;
      localStorage.setItem(WIDGET_VISIBLE_KEY, String(newVisibility));
      return newVisibility;
    });
  };

  return (
    <WidgetContext.Provider value={{ isWidgetVisible, toggleWidgetVisibility }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget debe ser usado dentro de un WidgetProvider');
  }
  return context;
}
