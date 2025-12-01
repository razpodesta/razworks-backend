/**
 * @fileoverview Registro Central de Herramientas (Tool Discovery)
 * @module Toolbox/Shared/Registry
 *
 * @author Raz Podestá & LIA Legacy
 * @description
 * Repositorio dinámico de todas las herramientas registradas en el sistema.
 * Permite filtrar herramientas por el 'RazterRealm' del usuario.
 * Vital para alimentar el contexto de la IA ("Esto es lo que puedes hacer por este usuario").
 */

import { Injectable } from '@nestjs/common';
import { RazTool } from '../base/raz-tool.base';
import { RazterRealm } from '@razworks/core';

@Injectable()
export class ToolRegistryService {
  // Almacenamos las herramientas inyectadas.
  // En una app real de NestJS, usaríamos DiscoveryModule para encontrarlas automáticamente,
  // pero para mantenerlo simple y explícito, las registraremos manualmente o via array.
  private tools: RazTool<any, any>[] = [];

  /**
   * Registra una herramienta en el sistema.
   */
  register(tool: RazTool<any, any>) {
    this.tools.push(tool);
  }

  /**
   * Obtiene las herramientas disponibles para un nivel específico.
   */
  getAvailableTools(userRealm: RazterRealm): RazTool<any, any>[] {
    // Instanciamos una herramienta temporal para usar su lógica de hasAccess
    // (o movemos hasAccess a un helper estático, por ahora filtramos usando la lógica base).

    // Truco: Usamos el método público `run` que ya tiene el chequeo, pero eso ejecuta.
    // Mejor: Exponer `metadata.requiredRealm` y comparar aquí.

    return this.tools.filter(tool => {
      const required = tool.metadata.requiredRealm;
      return this.checkAccess(userRealm, required);
    });
  }

  /**
   * Busca una herramienta por nombre exacto (para invocación por IA).
   */
  getToolByName(name: string): RazTool<any, any> | undefined {
    return this.tools.find(t => t.metadata.name === name);
  }

  // Lógica duplicada de jerarquía (Debería ir en Core/Shared, lo ponemos aquí por cohesión temporal)
  private checkAccess(userRealm: RazterRealm, requiredRealm: RazterRealm): boolean {
    const hierarchy: Record<RazterRealm, number> = {
      'THE_SCRIPT': 1,
      'THE_COMPILER': 2,
      'THE_KERNEL': 3,
      'THE_NETWORK': 4,
      'THE_SOURCE': 5
    };
    return hierarchy[userRealm] >= hierarchy[requiredRealm];
  }
}
