import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async getAllStoreSales(user: UpdateUserDTO) {
    const store = await this.prisma.store.findUnique({
      where: { owner_id: user.id },
    });

    if (!store) throw new NotFoundException("Store doesn't exists");

    const storeProducts = this.prisma.product.findMany({
      where: { store_id: store.id },
    });

    const productsIds = (await storeProducts).map((product) => product.id);

    return await this.prisma.historicItem.findMany({
      where: { product_id: { in: productsIds } },
      include: { product: true, historic: { select: { created_at: true } } },
    });
  }
}