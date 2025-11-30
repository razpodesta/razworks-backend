// RUTA: apps/web-admin/src/lib/hooks/use-scroll-direction.ts
// DESCRIPCIÓN: Un hook de React reutilizable y de alto rendimiento que rastrea
//              la posición y la dirección del scroll de la página.

'use client';

import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down';

export function useScrollDirection() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY) < 10) {
        // Ignoramos pequeños scrolls para evitar cambios de estado innecesarios.
        return;
      }

      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };

    // Añadimos el event listener al montar el componente.
    window.addEventListener('scroll', updateScrollDirection);

    // Es crucial devolver una función de limpieza para eliminar el listener
    // cuando el componente se desmonte, evitando memory leaks.
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, []);

  return { scrollY, scrollDirection };
}
