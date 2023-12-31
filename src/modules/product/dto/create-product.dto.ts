import {
  IsNotEmpty,
  IsString,
  IsDecimal,
  IsInt,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: Decimal;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image_url: string;

  @ApiProperty()
  @IsInt()
  ratings: number;

  @ApiProperty()
  @IsInt()
  stars: number;

  @ApiProperty()
  @IsInt()
  sold: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  store_id: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;
}
