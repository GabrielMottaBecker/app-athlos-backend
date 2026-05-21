import { AssociadoService } from "@associacao/associados/application/services/associado.service";
import { AssociadoMessagingService } from "@associacao/associados/application/services/associado-messaging.service";
import { ASSOCIADO_REPOSITORY } from "@associacao/associados/domain/repositories/associado-repository.interface";
import { AssociadosController } from "@associacao/associados/infra/controllers/associados.controller";
import { DrizzleAssociadoRepository } from "@associacao/associados/infra/repositories/drizzle-associado.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [AssociadosController],
  providers: [
    AssociadoService,
    AssociadoMessagingService,
    DrizzleAssociadoRepository,
    {
      provide: ASSOCIADO_REPOSITORY,
      useExisting: DrizzleAssociadoRepository,
    },
  ],
})
export class AssociadosModule {}
