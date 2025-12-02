import { Project } from '../../entities/project.entity';
import { Result } from '@razworks/shared-utils'; // ✅ FIX

export abstract class ProjectRepositoryPort {
  abstract create(project: Project): Promise<Result<void, Error>>;
  abstract searchBySimilarity(vector: number[], limit: number): Promise<Result<Project[], Error>>;
}
