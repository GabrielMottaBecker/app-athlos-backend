import { CargoService } from "@hierarquia/application/services/cargo.service";
import { CARGO_REPOSITORY } from "@hierarquia/domain/repositories/cargo-repository.interface";
import { CargosController } from "@hierarquia/infra/controllers/cargos.controller";
import { DrizzleCargoRepository } from "@hierarquia/infra/repositories/drizzle-cargo.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [CargosController],
  providers: [
    CargoService,
    DrizzleCargoRepository,
    {
      provide: CARGO_REPOSITORY,
      useExisting: DrizzleCargoRepository,
    },
  ],
})
export class HierarquiaModule {}
