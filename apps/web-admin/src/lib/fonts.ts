// RUTA: apps/web-admin/src/lib/fonts.ts
// VERSIÓN: 3.0 - Google Fonts Fallback Strategy (Build Rescue)
// DESCRIPCIÓN: Se eliminan las fuentes locales faltantes (Clash, Cabinet) y se
//              sustituyen por fuentes de Google optimizadas para desbloquear el despliegue.

import {
  Playfair_Display,
  Cinzel,
  Space_Grotesk,
  Merriweather,
  Syne,
  Bodoni_Moda,
  Italiana,
  Inter,
  Montserrat,
  DM_Sans,
  Open_Sans,
  Manrope,
  Lora,
  Tenor_Sans
} from 'next/font/google';
import localFont from 'next/font/local';

// --- 1. Fuentes Locales (Solo las confirmadas) ---
// Satoshi se mantiene porque es la fuente base del sistema y parece estar presente.
// Si Satoshi también falla, la reemplazaremos por Inter en el siguiente ciclo.

const fontSatoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
  fallback: ['sans-serif'],
});

// --- 2. Fuentes de Google (Arquetipos Standard & Fallbacks) ---

// Sustituto para Cabinet Grotesk: Space Grotesk (Tech/Modern)
const fontSpace = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap'
});

// Sustituto para Clash Display: Syne (Bold/Artistic) o Cinzel (High Impact)
// Usaremos Syne como fallback visual para títulos de impacto.
const fontSyne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap'
});

const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

const fontCinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap'
});

const fontMerriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap'
});

const fontBodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap'
});

const fontItaliana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
  display: 'swap'
});

// Body Fonts (Google)
const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fontMontserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
const fontDmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' });
const fontOpenSans = Open_Sans({ subsets: ['latin'], variable: '--font-open', display: 'swap' });
const fontManrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fontLora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const fontTenor = Tenor_Sans({ weight: '400', subsets: ['latin'], variable: '--font-tenor', display: 'swap' });

// --- 3. Mapa Maestro (Refactorizado) ---
// Mapeamos los nombres de diseño originales a las nuevas fuentes de Google.

export const fontMap: Record<string, { className: string, variable: string }> = {
  // Headings - Reemplazos Estratégicos
  'Clash Display': fontSyne,       // Fallback visual: Syne es audaz y moderna
  'Cabinet Grotesk': fontSpace,    // Fallback visual: Space Grotesk es geométrica

  // Headings - Google Nativos
  'Playfair Display': fontPlayfair,
  'Cinzel': fontCinzel,
  'Space Grotesk': fontSpace,
  'Merriweather': fontMerriweather,
  'Syne': fontSyne,
  'Bodoni Moda': fontBodoni,
  'Italiana': fontItaliana,

  // Bodies - Locales
  'Satoshi': fontSatoshi,

  // Bodies - Google
  'Inter': fontInter,
  'Lato': fontInter, // Fallback a Inter
  'Montserrat': fontMontserrat,
  'DM Sans': fontDmSans,
  'Open Sans': fontOpenSans,
  'Manrope': fontManrope,
  'Lora': fontLora,
  'Tenor Sans': fontTenor,
};

/**
 * Recupera la clase CSS de la fuente basada en el nombre definido en el JSON.
 * Implementa un fallback de seguridad a 'Inter' si la fuente no se encuentra.
 *
 * @param fontName Nombre de la fuente (ej: "Clash Display")
 * @returns string Clase CSS de Next.js (ej: "__className_12345")
 */
export function getFontClassName(fontName: string): string {
  const font = fontMap[fontName];
  if (!font) {
    // En producción, esto no debe romper el build, solo advertir.
    // Si la clave no existe, devolvemos Inter por defecto.
    return fontInter.className;
  }
  return font.className;
}
