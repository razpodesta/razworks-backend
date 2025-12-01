/**
 * @fileoverview Controlador de Proyectos
 * @module API/Projects
 */
import { Controller, Post, Get, Body, Query, Req, UseGuards, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectSchema, SearchProjectDto, SearchProjectSchema } from '@razworks/dtos';
import { ZodValidationPipe } from '@razworks/shared/utils';
// import { AuthGuard } from ... (Pendiente de módulo Auth real, usamos mock user por ahora)

// Mock Request Interface
interface RequestWithUser {
  user?: { id: string };
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto
  ) {
    // Simulación de User ID (En prod viene del JWT Guard)
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const result = await this.projectsService.create(userId, dto);

    if (result.isFailure) {
      const error = result.getError();
      // Mapeo de errores de Dominio a HTTP
      // Aquí se ve la potencia del Result Pattern: Control total.
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      projectId: result.getValue(),
      message: 'Proyecto publicado y vectorizado correctamente.'
    };
  }

  @Get('search')
  async search(@Query(new ZodValidationPipe(SearchProjectSchema)) query: SearchProjectDto) {
    const result = await this.projectsService.search(query);

    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }

    // Mapeamos la entidad de dominio a una respuesta JSON limpia
    return {
      results: result.getValue().map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        budget: `${p.budgetCents / 100} ${p.currency}`, // Formateo simple
        matchScore: 'Calculated internally' // Podríamos exponer el score de similitud si el Repo lo devolviera en la Entidad
      }))
    };
  }
}
