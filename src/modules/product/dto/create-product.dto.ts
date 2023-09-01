import { IsNotEmpty, IsString, IsDecimal, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO {
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
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image_urls: string;

  @ApiProperty()
  @IsInt()
  ratings: number;

  @ApiProperty()
  @IsInt()
  stars: number;

  @ApiProperty()
  @IsInt()
  sold: number;
}
