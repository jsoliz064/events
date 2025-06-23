import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventRepository } from './repositories/event.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEntity } from './entities/event.entity';

// 1. CREAMOS UN MOCK DEL REPOSITORIO
// Este objeto simulará ser nuestro EventRepository.
const mockEventRepository = {
  save: jest.fn(),
  findByName: jest.fn(),
  findByRoomAndOverlappingTime: jest.fn(),
  findInTimeRange: jest.fn(),
  deleteByName: jest.fn(),
};

describe('EventsService', () => {
  let service: EventsService;
  let repository: typeof mockEventRepository;

  // 2. CONFIGURAMOS EL ENTORNO DE PRUEBAS
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventRepository,
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get(EventRepository);

    // Limpiamos el historial de las funciones mockeadas antes de cada test
    jest.clearAllMocks();
  });

  // 3. ESCRIBIMOS NUESTROS CASOS DE PRUEBA
  describe('create', () => {
    const createEventDto = {
      name: 'Event A',
      room: 'Room 1',
      startTime: '2025-06-23T09:00:00.000Z',
      endTime: '2025-06-23T11:00:00.000Z',
    };

    // Escenario Principal: Creación exitosa
    it('should successfully create and save an event', async () => {
      // Arrange: Configuramos nuestros mocks para el caso de éxito
      repository.findByName.mockResolvedValue(null); // No hay evento con el mismo nombre
      repository.findByRoomAndOverlappingTime.mockResolvedValue([]); // No hay eventos superpuestos
      repository.save.mockImplementation((event) => Promise.resolve(event)); // El save devuelve el evento guardado

      // Act: Ejecutamos el método a probar
      const result = await service.create(createEventDto);

      // Assert: Verificamos que todo ocurrió como esperábamos
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result.name).toEqual(createEventDto.name);
    });

    // Caso Límite: Conflicto por nombre duplicado
    it('should throw a ConflictException if an event with the same name already exists', async () => {
      // Arrange: Simulamos que ya existe un evento con ese nombre
      repository.findByName.mockResolvedValue(new EventEntity());

      // Act & Assert: Verificamos que el servicio lance la excepción esperada
      await expect(service.create(createEventDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createEventDto)).rejects.toThrow(
        'An event with the name "Evento Test" already exists.',
      );
    });

    // Caso Límite: Conflicto por superposición de tiempo
    it('should throw a ConflictException if another event overlaps in the same room', async () => {
      // Arrange: Simulamos que no hay conflicto de nombre, pero sí de tiempo
      repository.findByName.mockResolvedValue(null);
      repository.findByRoomAndOverlappingTime.mockResolvedValue([
        new EventEntity(),
      ]); // Devolvemos un evento existente

      // Act & Assert: Verificamos la excepción de conflicto
      await expect(service.create(createEventDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createEventDto)).rejects.toThrow(
        'Room Salón 1 is already booked during this time.',
      );
    });
  });

  describe('cancel', () => {
    // Escenario Principal: Cancelación exitosa
    it('should call the repository to delete an event by name', async () => {
      // Arrange: El mock de deleteByName no necesita hacer nada, solo existir
      repository.deleteByName.mockResolvedValue(undefined);

      // Act
      await service.cancel('Evento a Cancelar');

      // Assert
      expect(repository.deleteByName).toHaveBeenCalledWith('Evento a Cancelar');
      expect(repository.deleteByName).toHaveBeenCalledTimes(1);
    });

    it('should re-throw a NotFoundException if the repository throws it', async () => {
      // Arrange: Simulamos que el repositorio lanza un error porque no encuentra el evento
      const errorMessage = 'Event with name "Evento Inexistente" not found';
      repository.deleteByName.mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      // Act & Assert
      await expect(service.cancel('Evento Inexistente')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancel('Evento Inexistente')).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('findActive', () => {
    // Escenario Principal: Consultar eventos activos
    it('should return a list of active events from the repository', async () => {
      const mockEvents = [new EventEntity(), new EventEntity()];
      // Arrange
      repository.findInTimeRange.mockResolvedValue(mockEvents);

      const startTime = new Date('2025-06-23T09:00:00.000Z');
      const endTime = new Date('2025-06-23T11:00:00.000Z');

      // Act
      const result = await service.findActive(startTime, endTime);

      // Assert
      expect(repository.findInTimeRange).toHaveBeenCalledWith(
        startTime,
        endTime,
      );
      expect(result).toEqual(mockEvents);
      expect(result.length).toBe(2);
    });
  });
});
