import { IsString, IsNumber, IsIn, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsIn(['PEDIDO', 'MENSALIDADE'])
  type!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  referenceId!: string;
}