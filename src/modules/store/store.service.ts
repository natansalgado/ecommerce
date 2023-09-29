import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async createStore(user: UpdateUserDTO, name: string) {
    const userAlreadyHaveAStore = await this.prisma.store.findUnique({
      where: { owner_id: user.id },
    });

    if (userAlreadyHaveAStore)
      throw new ConflictException('User already have a store');

    const RepeatedStoreName = await this.prisma.store.findFirst({
      where: { name },
    });

    if (RepeatedStoreName)
      throw new ConflictException(`The store name '${name}' is already in use`);

    return await this.prisma.store.create({
      data: { name, owner_id: user.id, balance: 0 },
    });
  }

  async getAllStores() {
    return await this.prisma.store.findMany({
      select: {
        id: true,
        name: true,
        products: true,
      },
    });
  }

  async getOneStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        products: true,
      },
    });

    if (!store) throw new NotFoundException("Store doesn't exists");

    return store;
  }

  async getMyStore(user: UpdateUserDTO) {
    const store = await this.prisma.store.findUnique({
      where: { owner_id: user.id },
      include: { products: { orderBy: { created_at: 'desc' } } },
    });

    if (!store) throw new NotFoundException('Store not found');

    return store;
  }
}
