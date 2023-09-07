import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cart_id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  product_id?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity?: number;
}
