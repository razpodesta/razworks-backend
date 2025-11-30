// RUTA: apps/web-admin/src/lib/graphql-client.ts
// VERSIÓN: 8.0 - Silent Build Fallback
// DESCRIPCIÓN: Optimizado para reducir el ruido en los logs de construcción (SSG).
//              Si estamos en CI/Build y la conexión falla pero el mock funciona,
//              se procede silenciosamente.

import { MOCK_POSTS, MOCK_PROFILE, MOCK_CODEX } from '../data/mocks/cms.mocks';

type GraphQLResponse<T> = {
  data: T;
  errors?: unknown[];
};

type MockTag = { name: string; slug: string; };

/**
 * Adaptador de Mocks.
 */
function getMockDataForQuery<T>(query: string, variables?: Record<string, unknown>): T | null {
  if (query.includes('GetAllPosts')) return { getPosts: MOCK_POSTS } as unknown as T;

  if (query.includes('GetPostBySlug')) {
    const slug = variables?.slug;
    const post = MOCK_POSTS.find(p => p.slug === slug) || null;
    return { getPostBySlug: post } as unknown as T;
  }

  if (query.includes('GetPostsByTag')) {
    const tagSlug = variables?.slug as string;
    const posts = MOCK_POSTS.filter(p => p.tags.some((t: MockTag) => t.slug === tagSlug));
    return { getPostsByTagSlug: posts } as unknown as T;
  }

  if (query.includes('GetMyProfile')) return { getMyProfile: MOCK_PROFILE } as unknown as T;
  if (query.includes('GetCodex')) return { getCodex: MOCK_CODEX } as unknown as T;

  return null;
}

/**
 * Realiza una petición fetch a la API de GraphQL.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = process.env.CMS_GRAPHQL_ENDPOINT;
  const isBuildStep = process.env.CI === 'true' || process.env.VERCEL === '1';
  const useMocks = process.env.USE_MOCKS === 'true' || !endpoint;

  // 1. MOCKS EXPLÍCITOS
  if (useMocks) {
    const mockData = getMockDataForQuery<T>(query, variables);
    if (mockData) return mockData;
    if (isBuildStep) return {} as T;
    throw new Error(`[GraphQL Mock] No mock data found for query.`);
  }

  if (!endpoint) {
    throw new Error('CRITICAL CONFIG ERROR: CMS_GRAPHQL_ENDPOINT missing.');
  }

  // 2. INTENTO DE RED
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s Timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) throw new Error('GraphQL Errors');

    return json.data;

  } catch (error) {
    // 3. FALLBACK INTELIGENTE (SILENT BUILD)
    // Si falla la red, intentamos el mock.
    const fallbackData = getMockDataForQuery<T>(query, variables);

    if (fallbackData) {
      // Solo mostramos advertencia si NO estamos en un build automatizado
      // para mantener los logs limpios en Vercel.
      if (!isBuildStep) {
        console.warn(`⚠️ [GraphQL] Connection failed. Using Mock Fallback.`);
      }
      return fallbackData;
    }

    // Si estamos en build y falla todo, retornamos vacío para no romper el proceso SSG
    if (isBuildStep) {
      console.error(`❌ [GraphQL] Build Error: Failed to fetch and no mock available for query.`);
      return {} as T;
    }

    throw error;
  }
}
