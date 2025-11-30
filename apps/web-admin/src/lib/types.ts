// RUTA: apps/web-admin/src/lib/types.ts
// VERSIÓN: Migrada a Portafolio

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl?: string; // El enlace a la demo en vivo es opcional
  codeUrl?: string; // El enlace al código es opcional
  tags: string[];
}
