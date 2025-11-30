// RUTA: apps/web-admin/src/lib/gamification/actions.ts
// VERSIÓN: 1.0 - Fetchers de Gamificación
// DESCRIPCIÓN: Acciones de servidor para obtener datos del Protocolo 33.
//              Maneja la autenticación implícita (cookies) al pasar la request.

import { fetchGraphQL } from '../graphql-client';
import type { GamificationProfileResponse, UserGamificationProfile, CodexResponse, Artifact } from './types';

/**
 * Obtiene el perfil de gamificación del usuario actual.
 * Requiere que el usuario esté autenticado (la cookie de sesión se pasa automáticamente en Server Components).
 */
export async function getMyGamificationProfile(): Promise<UserGamificationProfile | null> {
  const query = `
    query GetMyProfile {
      getMyProfile {
        level
        currentXp
        nextLevelXp
        progressPercent
        inventory {
          id
          acquiredAt
          isEquipped
          artifact {
            id
            slug
            name
            description
            house
            rarity
            baseValue
            visualData
          }
        }
      }
    }
  `;

  try {
    // Nota: fetchGraphQL debe manejar la propagación de cookies de sesión si es necesario
    // o recibir un token. En esta arquitectura, asumimos que el cliente HTTP o el middleware
    // maneja la identidad, o que esta llamada se hace desde un contexto autenticado.
    const data = await fetchGraphQL<GamificationProfileResponse>(query);
    return data.getMyProfile;
  } catch (error) {
    console.error('[Protocol 33] Error fetching profile:', error);
    return null;
  }
}

/**
 * Obtiene el Códice completo (Lista de todos los artefactos posibles).
 * Pública, no requiere autenticación.
 */
export async function getCodex(): Promise<Artifact[]> {
  const query = `
    query GetCodex {
      getCodex {
        id
        slug
        name
        description
        house
        rarity
        baseValue
        visualData
      }
    }
  `;

  try {
    const data = await fetchGraphQL<CodexResponse>(query);
    return data.getCodex;
  } catch (error) {
    console.error('[Protocol 33] Error fetching codex:', error);
    return [];
  }
}
