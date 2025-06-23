import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventRepository } from './repositories/event.repository';
import { InMemoryEventRepository } from './repositories/in-memory-event.repository';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: EventRepository,
      useClass: InMemoryEventRepository,
    },
  ],
})
export class EventsModule {}
