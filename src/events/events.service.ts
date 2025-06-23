import { ConflictException, Injectable } from '@nestjs/common';
import { EventRepository } from './repositories/event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(createEventDto: CreateEventDto): Promise<EventEntity> {
    const existingEventWithName = await this.eventRepository.findByName(
      createEventDto.name,
    );
    if (existingEventWithName) {
      throw new ConflictException(
        `An event with the name "${createEventDto.name}" already exists.`,
      );
    }

    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);

    const overlappingEvents =
      await this.eventRepository.findByRoomAndOverlappingTime(
        createEventDto.room,
        startTime,
        endTime,
      );

    if (overlappingEvents.length > 0) {
      throw new ConflictException(
        `Room ${createEventDto.room} is already booked during this time.`,
      );
    }

    const newEvent = new EventEntity();
    newEvent.name = createEventDto.name;
    newEvent.room = createEventDto.room;
    newEvent.startTime = startTime;
    newEvent.endTime = endTime;

    return this.eventRepository.save(newEvent);
  }

  async findActive(startTime: Date, endTime: Date): Promise<EventEntity[]> {
    return this.eventRepository.findInTimeRange(startTime, endTime);
  }

  async cancel(name: string): Promise<void> {
    await this.eventRepository.deleteByName(name);
  }
}
