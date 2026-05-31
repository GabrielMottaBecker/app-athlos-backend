import { IsString, IsNumber, IsIn, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['T-Shirts', 'Hoodies', 'Shorts', 'Acessórios'])
  category?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}