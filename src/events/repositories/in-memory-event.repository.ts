import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { EventEntity } from '../entities/event.entity';

@Injectable()
export class InMemoryEventRepository extends EventRepository {
  private readonly events = new Map<string, EventEntity>();

  async save(event: EventEntity): Promise<EventEntity> {
    this.events.set(event.name, event);
    return event;
  }

  async findByName(name: string): Promise<EventEntity | null> {
    return this.events.get(name) || null;
  }

  async findByRoomAndOverlappingTime(
    room: string,
    startTime: Date,
    endTime: Date,
  ): Promise<EventEntity[]> {
    const allEvents = Array.from(this.events.values());

    return allEvents.filter((event) => {
      const isSameRoom = event.room === room;

      const startsDuringEvent =
        startTime >= event.startTime && startTime < event.endTime;

      const endsDuringEvent =
        endTime > event.startTime && endTime <= event.endTime;

      const spansOverEvent =
        startTime <= event.startTime && endTime >= event.endTime;

      return (
        isSameRoom && (startsDuringEvent || endsDuringEvent || spansOverEvent)
      );
    });
  }

  async findInTimeRange(
    startTime: Date,
    endTime: Date,
  ): Promise<EventEntity[]> {
    const allEvents = Array.from(this.events.values());
    return allEvents.filter((event) => {
      const startsDuringEvent =
        event.startTime >= startTime && event.startTime < endTime;

      const endsDuringEvent =
        event.endTime > startTime && event.endTime <= endTime;

      const spansOverEvent =
        event.startTime <= startTime && event.endTime >= endTime;

      return startsDuringEvent || endsDuringEvent || spansOverEvent;
    });
  }

  async deleteByName(name: string): Promise<void> {
    if (!this.events.has(name)) {
      throw new NotFoundException(`Event with name "${name}" not found`);
    }
    this.events.delete(name);
  }
}
