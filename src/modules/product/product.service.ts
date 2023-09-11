import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDTO, user: UpdateUserDTO) {
    data.ratings = 0;
    data.stars = 0;
    data.sold = 0;
    data.vendor_id = user.id;
    return await this.prisma.product.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productExists) throw new NotFoundException("Product doesn't exists");

    return productExists;
  }

  async update(id: string, data: UpdateProductDTO, user: UpdateUserDTO) {
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productExists) throw new NotFoundException("Product doesn't exists");

    if (!(productExists.vendor_id === user.id || user.admin))
      throw new UnauthorizedException(
        'Only the vendor or an admin can update the product',
      );

    return await this.prisma.product.update({ data, where: { id } });
  }

  async delete(id: string, user: UpdateUserDTO) {
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productExists) throw new NotFoundException("Product doesn't exists");

    if (!(productExists.vendor_id === user.id || user.admin))
      throw new UnauthorizedException(
        'Only the vendor or an admin can delete the product',
      );

    await this.prisma.product.delete({ where: { id } });
    return { success: `Product '${productExists.title}' deleted` };
  }
}
