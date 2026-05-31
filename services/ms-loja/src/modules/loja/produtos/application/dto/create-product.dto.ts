import { IsString, IsNumber, IsIn, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsIn(['T-Shirts', 'Hoodies', 'Shorts', 'Acessórios'])
  category: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}