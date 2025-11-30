import { redirect } from 'next/navigation';
import { i18n } from '@/config/i18n.config';

// Este archivo solo captura errores 404 a nivel raíz (ej: domain.com/archivo-inexistente.php)
// Como no tenemos contexto de idioma, asumimos el default.
export default function GlobalNotFound() {
  // Redirige a la Home del idioma por defecto.
  // Si el usuario intentó acceder a una ruta interna inválida sin locale,
  // el middleware ya habrá intentado corregirlo. Si llegamos aquí, es un fallo total.
  redirect(`/${i18n.defaultLocale}`);
}
