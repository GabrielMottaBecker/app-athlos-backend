import { ConfirmarPresencaEventoDto } from "@feed/eventos/application/dto/confirmar-presenca-evento.dto";
import { CreateEventoDto } from "@feed/eventos/application/dto/create-evento.dto";
import { EventoDto } from "@feed/eventos/application/dto/evento.dto";
import { PresencaParticipanteDto } from "@feed/eventos/application/dto/presenca-participante.dto";
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

  async findById(id: string, usuarioId?: string): Promise<EventoDto | null> {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) return null;

    const confirmado = usuarioId
      ? Boolean(await this.presencaRepository.findByEventoAndUsuario(id, usuarioId))
      : false;

    return EventoDto.fromEvento(evento, confirmado);
  }

  async findByAtletica(atleticaId: string, usuarioId?: string): Promise<EventoDto[]> {
    const rows = await this.eventoRepository.findByAtletica(atleticaId);
    return this.toDtosWithConfirmacao(rows, usuarioId);
  }

  async findByAtleticaAndType(
    atleticaId: string,
    type: TipoEvento,
    usuarioId?: string,
  ): Promise<EventoDto[]> {
    const rows = await this.eventoRepository.findByAtleticaAndType(atleticaId, type);
    return this.toDtosWithConfirmacao(rows, usuarioId);
  }

  private async toDtosWithConfirmacao(
    rows: Evento[],
    usuarioId?: string,
  ): Promise<EventoDto[]> {
    if (!usuarioId || rows.length === 0) {
      return rows.map((row) => EventoDto.fromEvento(row)!);
    }

    const confirmedIds = await this.presencaRepository.findConfirmedEventIds(
      usuarioId,
      rows.map((row) => row.id!),
    );

    return rows.map((row) => EventoDto.fromEvento(row, confirmedIds.has(row.id!))!);
  }

  async confirmarPresenca(
    eventoId: string,
    dto: ConfirmarPresencaEventoDto | undefined,
    usuarioAutenticadoId: string,
    emailAutenticado: string,
  ): Promise<void> {
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    const usuarioId = dto?.usuarioId ?? usuarioAutenticadoId;
    const existente = await this.presencaRepository.findByEventoAndUsuario(
      eventoId,
      usuarioId,
    );

    // Idempotente: se o usuario ja confirmou presenca, apenas retorna com
    // sucesso (sem erro) em vez de 409 — evita falhas no client em caso de
    // reabertura de tela, retry de rede, ou clique duplicado.
    if (existente) return;

    const presenca = PresencaEvento.restore({
      eventoId,
      usuarioId,
      email: emailAutenticado,
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
    // Idempotente: se nao havia presenca confirmada, nao ha nada a fazer.
    if (!presenca) return;

    await this.presencaRepository.delete(eventoId, usuarioId);
  }

  /** Uso administrativo: lista quem confirmou presenca em um evento/treino. */
  async listarPresencas(eventoId: string): Promise<PresencaParticipanteDto[]> {
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) throw new NotFoundException("Evento nao encontrado");

    const presencas = await this.presencaRepository.findByEvento(eventoId);
    return presencas.map((presenca) => PresencaParticipanteDto.fromPresenca(presenca));
  }
}