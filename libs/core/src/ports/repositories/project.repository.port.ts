/**
 * @fileoverview Puerto del Repositorio de Proyectos
 * @module Core/Ports
 */
import { Project } from '../../entities/project.entity';
import { Result } from '@razworks/shared/utils';

export abstract class ProjectRepositoryPort {
  /** Guarda el proyecto y sus vectores en una transacción atómica */
  abstract create(project: Project): Promise<Result<void, Error>>;

  /** Busca proyectos similares semánticamente */
  abstract searchBySimilarity(vector: number[], limit: number): Promise<Result<Project[], Error>>;
}
