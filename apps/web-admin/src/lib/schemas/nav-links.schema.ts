// RUTA: apps/web-admin/src/lib/schemas/nav-links.schema.ts
// VERSIÓN: 5.0 - Expandido con Nuevas Carteras de Servicios.
// DESCRIPCIÓN: Se añaden las claves para las nuevas categorías de Branding y
//              Creación de Contenidos, asegurando la validación completa.

import { z } from 'zod';

export const navLinksSchema = z.object({
  nav_links: z.object({
    // Estructura existente...
    sobre_mi: z.string(),
    servicios: z.string(),
    frontend: z.string(),
    backend: z.string(),
    proyectos: z.string(),
    cocreacion: z.string(),
    historia: z.string(),
    blog: z.string(),
    contacto: z.string(),
    contacto_directo: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    nextjs: z.string(),
    react: z.string(),
    tailwind_css: z.string(),
    svelte: z.string(),
    nodejs: z.string(),
    nestjs: z.string(),
    databases: z.string(),
    ecommerce: z.string(),
    shopify: z.string(),
    woocommerce: z.string(),
    prestashop: z.string(),
    vtex: z.string(),
    seo_positioning: z.string(),
    paid_traffic: z.string(),
    google_ads: z.string(),
    meta_ads: z.string(),
    whatsapp_ads: z.string(),
    tiktok_ads: z.string(),
    spotify_ads: z.string(),
    custom_solutions: z.string(),
    terminos_servicio: z.string(),
    politica_privacidad: z.string(),

    // --- NUEVAS CLAVES DE SERVICIOS ---
    branding_marca: z.string(),
    creacion_contenidos: z.string(),
    imagenes: z.string(),
    videos: z.string(),
    musica: z.string(),
    jingles: z.string(),
    web_components: z.string(),
    styling_strategies: z.string(),
    nx_monorepo: z.string(),
    postgresql: z.string(),
    mongodb: z.string(),
    sistema_de_diseno: z.string(),
  }),
});
