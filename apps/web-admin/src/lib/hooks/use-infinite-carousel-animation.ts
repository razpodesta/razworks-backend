// RUTA: apps/web-admin/src/lib/hooks/use-infinite-carousel-animation.ts
// VERSIÓN: 1.1 - Tipado Robusto y Realista.
// DESCRIPCIÓN: Se ha corregido la firma de tipo para que la propiedad 'ref'
//              acepte explícitamente `React.RefObject<HTMLDivElement | null>`.
//              Esto alinea la "promesa" del hook con la "realidad" de las refs de React
//              inicializadas con `null`, resolviendo el error de compilación de forma
//              segura y sin aserciones no nulas.

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';

// Se definen las opciones para cada riel de animación
type TrackAnimationOptions = {
  // --- INICIO DE LA CORRECCIÓN DE TIPO ---
  // Se acepta que la referencia puede ser nula, que es el comportamiento
  // estándar de useRef cuando se inicializa con `null`.
  ref: React.RefObject<HTMLDivElement | null>;
  // --- FIN DE LA CORRECCIÓN DE TIPO ---
  duration: number;
  direction?: -1 | 1;
};

/**
 * Un hook de React que aplica una animación de carrusel infinita a uno o más
 * elementos contenedores (tracks).
 *
 * @param tracks - Un array de objetos, donde cada objeto contiene la referencia
 *                 al elemento del DOM, la duración deseada de la animación en segundos,
 *                 y la dirección opcional (-1 para derecha, 1 para izquierda).
 */
export function useInfiniteCarouselAnimation(tracks: TrackAnimationOptions[]) {
  useLayoutEffect(() => {
    // La animación solo se ejecuta en el lado del cliente.
    if (typeof window === 'undefined') {
      return;
    }

    // Se crea un contexto de GSAP para una limpieza segura de las animaciones.
    const ctx = gsap.context(() => {
      tracks.forEach(({ ref, duration, direction = 1 }) => {
        const trackElement = ref.current;

        // El guardián de tipo que ya teníamos se vuelve aún más crucial.
        // Maneja de forma segura el caso en que la ref aún no esté asignada.
        if (!trackElement) {
          console.warn('Referencia de track para la animación no encontrada.');
          return;
        }

        const originalChildren = Array.from(trackElement.children);

        originalChildren.forEach(child => {
          trackElement.appendChild(child.cloneNode(true));
        });

        gsap.to(trackElement, {
          x: `${-50 * direction}%`,
          duration: duration,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % (trackElement.offsetWidth / 2) * direction)
          }
        });
      });
    });

    // La función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => ctx.revert();
  }, [tracks]); // El efecto se vuelve a ejecutar si la configuración de los tracks cambia.
}
