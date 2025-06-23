import { ApiProperty } from '@nestjs/swagger';

export class EventEntity {
  @ApiProperty({
    description: 'El nombre único del evento.',
    example: 'Event A',
  })
  name: string;

  @ApiProperty({
    description: 'El salón asignado al evento.',
    example: 'Room 1',
  })
  room: string;

  @ApiProperty({
    description: 'La fecha y hora de inicio del evento.',
    example: '2025-06-23T09:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'La fecha y hora de finalización del evento.',
    example: '2025-06-23T11:00:00.000Z',
  })
  endTime: Date;
}