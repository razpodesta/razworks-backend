/**
 * @fileoverview Coordinador Agéntico (Tool Use Orchestrator - Production Ready)
 * @module AiSystem/Services
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Motor de ejecución del ciclo de vida agéntico: "Pensar -> Actuar -> Observar -> Responder".
 * Implementa el patrón ReAct (Reasoning + Acting) sobre una arquitectura sin estado.
 *
 * FUNCIONALIDAD:
 * 1. Transforma herramientas de negocio (RazTool) a definiciones comprensibles por la IA.
 * 2. Orquesta el bucle de retroalimentación (Feedback Loop).
 * 3. Ejecuta herramientas de forma segura y captura sus resultados.
 * 4. Alimenta los resultados de vuelta al Córtex para la síntesis final.
 *
 * @requires AiProviderPort
 * @requires GeminiSchemaMapper
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiProviderPort, AiToolDefinition } from '../ports/ai-provider.port';
import { GeminiSchemaMapper } from '../adapters/gemini-schema.mapper';
import { Result } from '@razworks/shared/utils';

// Definición de la interfaz genérica de herramienta compatible con RazTool
// Esto desacopla el servicio de la implementación concreta de Toolbox.
export interface GenericTool {
  metadata: {
    name: string;
    description: string;
    requiredRealm?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(input: any, userRealm: any): Promise<Result<any, Error>>;
}

// Protocolo interno de comunicación con el Adaptador
interface FunctionCallProtocol {
  _type: 'FUNCTION_CALL';
  name: string;
  args: Record<string, unknown>;
}

@Injectable()
export class AgenticCoordinatorService {
  private readonly logger = new Logger(AgenticCoordinatorService.name);

  // Límite de seguridad para evitar bucles infinitos (ej: IA llamando a la misma herramienta eternamente)
  private readonly MAX_ITERATIONS = 5;

  constructor(
    private readonly aiProvider: AiProviderPort,
    private readonly schemaMapper: GeminiSchemaMapper
  ) {}

  /**
   * Ejecuta el bucle agéntico completo.
   *
   * @param originalPrompt La intención inicial del usuario.
   * @param availableTools Lista de herramientas autorizadas para este usuario.
   * @param userContext Contexto de seguridad (ID, Realm) para la ejecución de herramientas.
   * @returns La respuesta final de texto sintetizada por la IA tras usar las herramientas.
   */
  async executeAgenticLoop(
    originalPrompt: string,
    availableTools: GenericTool[],
    userContext: { userId: string; realm: string }
  ): Promise<Result<string, Error>> {

    this.logger.log(`🤖 Iniciando Bucle Agéntico para: "${originalPrompt.substring(0, 50)}..."`);

    // 1. Preparación de Definiciones (Zod -> AI Schema)
    // SE USA: 'toolDefinitions' se pasa ahora al aiProvider
    const toolDefinitions: AiToolDefinition[] = availableTools.map(tool =>
      this.schemaMapper.toGeminiFunction(
        tool.metadata.name,
        tool.metadata.description,
        tool.schema
      )
    );

    // Variable mutable para acumular el contexto de la conversación dentro del bucle
    // Inicialmente es solo el prompt del usuario.
    let currentPromptContext = originalPrompt;

    // Historial de ejecución para depuración
    const executionTrace: string[] = [];

    // =================================================================================
    // EL BUCLE DE RAZONAMIENTO (THE LOOP)
    // =================================================================================
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      this.logger.debug(`🔄 Iteración ${i + 1}/${this.MAX_ITERATIONS}`);

      // A. Invocar a la Inteligencia Artificial
      const aiResult = await this.aiProvider.generateText(currentPromptContext, {
        tools: toolDefinitions, // ✅ FIX: Variable usada correctamente
        temperature: 0.2 // Baja temperatura para precisión en uso de herramientas
      });

      if (aiResult.isFailure) {
        return Result.fail(aiResult.getError());
      }

      const responseText = aiResult.getValue();

      // B. Analizar si la IA quiere ejecutar una función
      // Intentamos parsear la respuesta como nuestro protocolo de Function Call
      const functionCall = this.tryParseFunctionCall(responseText);

      if (!functionCall) {
        // CASO BASE: La IA respondió con texto normal. El bucle termina.
        this.logger.log(`✅ Agente finalizó con respuesta textual en iteración ${i + 1}.`);
        return Result.ok(responseText);
      }

      // C. Ejecución de Herramienta (Branch de Acción)
      const { name, args } = functionCall;
      const tool = availableTools.find(t => t.metadata.name === name);

      if (!tool) {
        // Error: La IA alucinó una herramienta que no existe.
        // Alimentamos el error de vuelta para que la IA se corrija.
        const errorMessage = `Error: Tool '${name}' not found in registry.`;
        this.logger.warn(`⚠️ IA solicitó herramienta inexistente: ${name}`);

        currentPromptContext += `\n[SYSTEM_ERROR]: ${errorMessage}\n(Please try a different approach or answer directly)`;
        executionTrace.push(`Attempted ${name} (Not Found)`);
        continue;
      }

      // D. Ejecutar la Herramienta
      this.logger.log(`🛠️ Ejecutando Herramienta: [${name}] con args: ${JSON.stringify(args)}`);

      let toolOutput: string;

      try {
        // ✅ FIX: 'userContext' se usa aquí para pasar el Realm a la herramienta
        const executionResult = await tool.run(args, userContext.realm);

        if (executionResult.isSuccess) {
          const data = executionResult.getValue();
          toolOutput = JSON.stringify(data);
          this.logger.debug(`✅ Resultado Herramienta: ${toolOutput.substring(0, 100)}...`);
        } else {
          // Capturamos error controlado de la herramienta (ej: Permisos insuficientes)
          toolOutput = `Error: ${executionResult.getError().message}`;
          this.logger.warn(`⚠️ Fallo en Herramienta: ${toolOutput}`);
        }
      } catch (unexpectedError) {
        const err = unexpectedError instanceof Error ? unexpectedError : new Error(String(unexpectedError));
        toolOutput = `Critical Execution Error: ${err.message}`;
        this.logger.error(`🔥 Pánico en Herramienta ${name}:`, err);
      }

      // E. Actualizar Contexto para la Siguiente Iteración
      // Le decimos a la IA lo que pasó para que razone sobre el resultado.
      currentPromptContext += `\n\n[OBSERVATION] Tool '${name}' executed.\nArguments: ${JSON.stringify(args)}\nResult: ${toolOutput}\n\n(Based on this observation, provide the final answer to the user or call another tool)`;

      executionTrace.push(`${name} -> ${toolOutput.substring(0, 20)}...`);
    }

    // =================================================================================

    // Si llegamos aquí, se agotaron las iteraciones (Loop Infinito o Tarea muy compleja).
    this.logger.warn(`🛑 Agente detenido por límite de iteraciones. Trace: ${executionTrace.join(' -> ')}`);

    return Result.fail(new Error('Agent loop limit exceeded. The task was too complex or the model entered a loop.'));
  }

  /**
   * Intenta detectar y parsear el protocolo JSON de llamada a función.
   * @param text Respuesta cruda del modelo
   */
  private tryParseFunctionCall(text: string): FunctionCallProtocol | null {
    try {
      const trimmed = text.trim();
      // Heurística rápida: debe parecer un objeto JSON y contener la firma del protocolo
      if (trimmed.startsWith('{') && trimmed.includes('_type') && trimmed.includes('FUNCTION_CALL')) {
        const parsed = JSON.parse(trimmed);
        if (parsed._type === 'FUNCTION_CALL' && parsed.name && parsed.args) {
          return parsed as FunctionCallProtocol;
        }
      }
    } catch {
      // No es un JSON válido, por lo tanto es texto normal.
      return null;
    }
    return null;
  }
}
