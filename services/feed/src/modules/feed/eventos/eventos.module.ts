import { EventoService } from "@feed/eventos/application/services/evento.service";
import { EventoMessagingService } from "@feed/eventos/application/services/evento-messaging.service";
import { EVENTO_REPOSITORY } from "@feed/eventos/domain/repositories/evento-repository.interface";
import { PRESENCA_EVENTO_REPOSITORY } from "@feed/eventos/domain/repositories/presenca-evento-repository.interface";
import { EventosController } from "@feed/eventos/infra/controllers/eventos.controller";
import { DrizzleEventoRepository } from "@feed/eventos/infra/repositories/drizzle-evento.repository";
import { DrizzlePresencaEventoRepository } from "@feed/eventos/infra/repositories/drizzle-presenca-evento.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [EventosController],
  providers: [
    EventoService,
    EventoMessagingService,
    DrizzleEventoRepository,
    DrizzlePresencaEventoRepository,
    {
      provide: EVENTO_REPOSITORY,
      useExisting: DrizzleEventoRepository,
    },
    {
      provide: PRESENCA_EVENTO_REPOSITORY,
      useExisting: DrizzlePresencaEventoRepository,
    },
  ],
})
export class EventosModule {}
