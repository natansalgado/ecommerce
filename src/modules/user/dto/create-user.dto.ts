import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDecimal,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  balance: number;

  @ApiProperty()
  @IsOptional() // O campo é opcional
  @IsDate()
  created_at?: Date;

  @IsOptional() // O campo é opcional
  @IsDate()
  updated_at?: Date;

  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
    this.balance = 0;
  }
}
