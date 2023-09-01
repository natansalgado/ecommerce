import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDTO) {
    data.ratings = 0;
    data.stars = 0;
    data.sold = 0;
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

  async update(id: string, data: UpdateProductDTO) {
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productExists) throw new NotFoundException("Product doesn't exists");

    return await this.prisma.product.update({ data, where: { id } });
  }

  async delete(id: string) {
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productExists) throw new NotFoundException("Product doesn't exists");

    await this.prisma.product.delete({ where: { id } });

    return { success: `Product '${productExists.title}' deleted` };
  }
}
