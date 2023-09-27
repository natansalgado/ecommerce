import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateProductDTO } from 'src/modules/product/dto/update-product.dto';
import { Decimal } from '@prisma/client/runtime/library';

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

  @ApiProperty()
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price?: Decimal;

  product?: UpdateProductDTO;
}
