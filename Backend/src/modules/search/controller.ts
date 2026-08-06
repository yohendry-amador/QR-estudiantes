import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Búsqueda global de estudiantes, secciones y cursos' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') query: string) {
    return this.searchService.search(query);
  }
}