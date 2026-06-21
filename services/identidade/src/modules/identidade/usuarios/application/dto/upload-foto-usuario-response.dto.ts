import { ApiProperty } from "@nestjs/swagger";

export class UploadFotoUsuarioResponseDto {
  @ApiProperty({ example: "http://localhost:4002/uploads/usuarios/uuid.jpg" })
  fotoUrl!: string;
}