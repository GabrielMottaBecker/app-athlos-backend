import { Module } from "@nestjs/common";
import { EventosModule } from "./eventos/eventos.module";

@Module({
  imports: [EventosModule],
})
export class FeedModule {}
