import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';
import { CartItemDTO } from '../cart/dto/cartItem.dto';

@Injectable()
export class HistoricService {
  constructor(private prisma: PrismaService) {}

  async create(user: UpdateUserDTO) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: user.id },
      include: { cartItems: true },
    });

    if (!cart) throw new NotFoundException("Cart doesn't exists");

    if (Number(user.balance) < Number(cart.total_price))
      throw new BadRequestException('Insufficient funds');

    const cartItems = cart.cartItems;
    if (cartItems.length <= 0) throw new NotFoundException('Cart is empty');

    const insufficientProducts = await this.verifyProductQuantity(cartItems);
    if (insufficientProducts.length > 0) {
      throw new BadRequestException(
        `Insufficient products: '${insufficientProducts.join(', ')}'`,
      );
    }

    let total_price = 0;

    cartItems.map((item) => {
      total_price += Number(item.price);
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: total_price } },
    });

    const historic = await this.prisma.historic.create({
      data: { user_id: user.id, total_price },
    });

    const historicItems = cartItems.map((item) => {
      return {
        product_id: item.product_id,
        historic_id: historic.id,
        price: item.price,
        quantity: item.quantity,
      };
    });

    await this.prisma.historicItem.createMany({ data: historicItems });

    await this.decreaseQuantity(cartItems);

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { total_price: 0 },
    });

    return { historic: { ...historic, historicItems } };
  }

  async getUserHistorics(user: UpdateUserDTO) {
    return await this.prisma.historic.findMany({
      where: { user_id: user.id },
      include: { historic_items: { include: { product: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async getOneHistoric(user: UpdateUserDTO, id: string) {
    const historic = await this.prisma.historic.findUnique({
      where: { id },
      include: { historic_items: { include: { product: true } } },
    });

    if (!historic) throw new NotFoundException('Historic not found');

    if (!(historic.user_id === user.id || user.admin))
      throw new UnauthorizedException(
        'Only the user or a adimin can see the historic',
      );

    return historic;
  }

  async verifyProductQuantity(cartItems: CartItemDTO[]) {
    const insufficientProducts = [];
    await Promise.all(
      cartItems.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.product_id },
        });

        if (product.quantity < item.quantity)
          insufficientProducts.push(product.title);
      }),
    );
    return insufficientProducts;
  }

  async decreaseQuantity(cartItems: CartItemDTO[]) {
    await Promise.all(
      cartItems.map(async (item) => {
        await this.prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: { decrement: item.quantity },
            sold: { increment: 1 },
          },
        });
      }),
    );
  }
}
