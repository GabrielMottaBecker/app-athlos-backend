import { Module } from "@nestjs/common";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { AtleticasModule } from "./atleticas/atleticas.module";

@Module({
  imports: [
    UsuariosModule,
    AtleticasModule,
  ],
})
export class IdentidadeModule {}