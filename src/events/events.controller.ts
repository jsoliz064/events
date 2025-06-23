import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EventEntity } from './entities/event.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo evento' })
  @ApiResponse({
    status: 201,
    description: 'El evento ha sido creado exitosamente.',
    type: EventEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto. El nombre del evento ya existe o el salón ya está ocupado en ese horario.',
  })
  create(@Body() createEventDto: CreateEventDto): Promise<EventEntity> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar eventos activos en un rango de tiempo' })
  @ApiQuery({
    name: 'startTime',
    required: true,
    description: 'Fecha de inicio del rango de búsqueda (Formato ISO 8601)',
    example: '2025-06-23T09:00:00.000Z',
  })
  @ApiQuery({
    name: 'endTime',
    required: true,
    description: 'Fecha de fin del rango de búsqueda (Formato ISO 8601)',
    example: '2025-06-23T11:00:00.000Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos activos encontrados en el rango de tiempo.',
    type: [EventEntity],
  })
  findActive(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<EventEntity[]> {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return this.eventsService.findActive(start, end);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar un evento por su nombre' })
  @ApiParam({
    name: 'name',
    description: 'El nombre único del evento a cancelar',
    example: 'Event A',
  })
  @ApiResponse({
    status: 204,
    description: 'El evento ha sido cancelado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'El evento con el nombre especificado no fue encontrado.',
  })
  cancel(@Param('name') name: string): Promise<void> {
    return this.eventsService.cancel(name);
  }
}
