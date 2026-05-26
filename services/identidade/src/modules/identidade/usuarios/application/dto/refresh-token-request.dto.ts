import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenRequestDto {
  @ApiProperty({ description: "Refresh token obtido no login" })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
