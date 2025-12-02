/**
 * @fileoverview Registro Central de Herramientas (Tool Discovery) - TYPE SAFE
 * @module Toolbox/Shared/Registry
 */
import { Injectable } from '@nestjs/common';
import { RazTool } from '../base/raz-tool.base';
import { RazterRealm } from '@razworks/core';

@Injectable()
export class ToolRegistryService {
  // ✅ FIX: Eliminado 'any' usando 'unknown' que es más seguro
  private tools: RazTool<unknown, unknown>[] = [];

  register(tool: RazTool<unknown, unknown>) {
    this.tools.push(tool);
  }

  getAvailableTools(userRealm: RazterRealm): RazTool<unknown, unknown>[] {
    return this.tools.filter(tool => {
      const required = tool.metadata.requiredRealm;
      return this.checkAccess(userRealm, required);
    });
  }

  getToolByName(name: string): RazTool<unknown, unknown> | undefined {
    return this.tools.find(t => t.metadata.name === name);
  }

  private checkAccess(userRealm: RazterRealm, requiredRealm: RazterRealm): boolean {
     // ... (lógica igual)
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
