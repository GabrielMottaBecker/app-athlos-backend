import { ConfirmarPresencaEventoDto } from "@feed/eventos/application/dto/confirmar-presenca-evento.dto";
import { CreateEventoDto } from "@feed/eventos/application/dto/create-evento.dto";
import { EventoDto } from "@feed/eventos/application/dto/evento.dto";
import { EventoMessagingService } from "@feed/eventos/application/services/evento-messaging.service";
import { UpdateEventoDto } from "@feed/eventos/application/dto/update-evento.dto";
import { Evento, TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import { PresencaEvento, StatusPresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";
import {
  EVENTO_REPOSITORY,
  type EventoRepository,
} from "@feed/eventos/domain/repositories/evento-repository.interface";
import {
  PRESENCA_EVENTO_REPOSITORY,
  type PresencaEventoRepository,
} from "@feed/eventos/domain/repositories/presenca-evento-repository.interface";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class EventoService {
  constructor(
    @Inject(EVENTO_REPOSITORY)
    private readonly eventoRepository: EventoRepository,
    @Inject(PRESENCA_EVENTO_REPOSITORY)
    private readonly presencaRepository: PresencaEventoRepository,
    private readonly messagingService: EventoMessagingService,
  ) {}

  async create(dto: CreateEventoDto): Promise<void> {
    const evento = Evento.restore({
      title: dto.title,
      date: dto.date,
      type: dto.type,
      typeColor: dto.typeColor,
      time: dto.time,
      place: dto.place,
      bgColor: dto.bgColor,
      atleticaId: dto.atleticaId,
    })!;

    const eventoCriado = await this.eventoRepository.create(evento);

    if (eventoCriado) {
      await this.messagingService.publishEventoCreated(
        EventoDto.fromEvento(eventoCriado)!,
      );
    }
  }

  async edit(id: string, dto: UpdateEventoDto): Promise<void> {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    if (dto.title) evento.withTitle(dto.title);
    if (dto.date) evento.withDate(dto.date);
    if (dto.type) evento.withType(dto.type);
    if (dto.typeColor !== undefined) evento.withTypeColor(dto.typeColor);
    if (dto.time) evento.withTime(dto.time);
    if (dto.place) evento.withPlace(dto.place);
    if (dto.bgColor !== undefined) evento.withBgColor(dto.bgColor);

    await this.eventoRepository.update(evento);
    await this.messagingService.publishEventoUpdated(
      EventoDto.fromEvento(evento)!,
    );
  }

  async remove(id: string): Promise<void> {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    await this.eventoRepository.delete(id);
    await this.messagingService.publishEventoDeleted(
      EventoDto.fromEvento(evento)!,
    );
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<EventoDto>> {
    const { rows, total } = await this.eventoRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => EventoDto.fromEvento(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<EventoDto | null> {
    const evento = await this.eventoRepository.findById(id);
    return EventoDto.fromEvento(evento);
  }

  async findByAtletica(atleticaId: string): Promise<EventoDto[]> {
    const rows = await this.eventoRepository.findByAtletica(atleticaId);
    return rows.map((row) => EventoDto.fromEvento(row)!);
  }

  async findByAtleticaAndType(
    atleticaId: string,
    type: TipoEvento,
  ): Promise<EventoDto[]> {
    const rows = await this.eventoRepository.findByAtleticaAndType(atleticaId, type);
    return rows.map((row) => EventoDto.fromEvento(row)!);
  }

  async confirmarPresenca(
    eventoId: string,
    dto: ConfirmarPresencaEventoDto | undefined,
    usuarioAutenticadoId: string,
  ): Promise<void> {
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    const usuarioId = dto?.usuarioId ?? usuarioAutenticadoId;
    const existente = await this.presencaRepository.findByEventoAndUsuario(
      eventoId,
      usuarioId,
    );

    if (existente) throw new ConflictException("Presenca ja confirmada");

    const presenca = PresencaEvento.restore({
      eventoId,
      usuarioId,
      status: StatusPresencaEvento.CONFIRMADA,
    })!;

    await this.presencaRepository.confirm(presenca);
  }

  async removerPresenca(eventoId: string, usuarioId: string): Promise<void> {
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    const presenca = await this.presencaRepository.findByEventoAndUsuario(
      eventoId,
      usuarioId,
    );
    if (!presenca) throw new NotFoundException("Presenca nao encontrada");

    await this.presencaRepository.delete(eventoId, usuarioId);
  }
}
