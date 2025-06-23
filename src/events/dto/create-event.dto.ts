import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'El nombre único del evento. Se usará como identificador.',
    example: 'Event A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'El salón donde se realizará el evento.',
    example: 'Room 1',
  })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({
    description: 'La fecha y hora de inicio del evento en formato ISO 8601.',
    example: '2025-06-23T09:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'La fecha y hora de finalización del evento en formato ISO 8601.',
    example: '2025-06-23T11:00:00.000Z',
  })
  @IsDateString()
  endTime: string;
}