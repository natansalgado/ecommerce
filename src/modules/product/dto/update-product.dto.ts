import { PartialType } from '@nestjs/swagger';
import { CreateProductDTO } from './create-product.dto';

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
