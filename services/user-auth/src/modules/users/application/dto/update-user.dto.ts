import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "user@school.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "novaSenha123", required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    enum: Permission,
    isArray: true,
    required: false,
    example: [Permission.ASSOCIADOS_READ],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}