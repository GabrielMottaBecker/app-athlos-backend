import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "user@school.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "senha123" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    enum: Permission,
    isArray: true,
    example: [Permission.ASSOCIADOS_READ],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}