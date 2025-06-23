import { EventEntity } from '../entities/event.entity';

export abstract class EventRepository {
  abstract save(event: EventEntity): Promise<EventEntity>;

  abstract findByName(name: string): Promise<EventEntity | null>;

  abstract findByRoomAndOverlappingTime(
    room: string,
    startTime: Date,
    endTime: Date,
  ): Promise<EventEntity[]>;

  abstract findInTimeRange(
    startTime: Date,
    endTime: Date,
  ): Promise<EventEntity[]>;

  abstract deleteByName(name: string): Promise<void>;
}
