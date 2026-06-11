import { Module } from "@nestjs/common";
import { AtleticasController } from "./infra/controllers/atleticas.controller";
import { AtleticaService } from "./application/services/atletica.service";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [AtleticasController],
  providers: [AtleticaService],
})
export class AtleticasModule {}