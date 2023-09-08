import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';
import { CartItemDTO } from './dto/cartItem.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addItem(user: UpdateUserDTO, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.prisma.cart.findFirst({
      where: { user_id: user.id },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
    }

    const cartItemExists = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });

    let cartItem: CartItemDTO;

    if (cartItemExists) {
      cartItem = await this.prisma.cartItem.update({
        where: { id: cartItemExists.id },
        data: {
          quantity: { increment: quantity },
          price: { increment: Number(product.price) * quantity },
        },
      });
    } else {
      cartItem = await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productId } },
          quantity,
          price: Number(product.price) * quantity,
        },
      });
    }

    if (product.quantity < cartItem.quantity)
      throw new BadRequestException('Insufficient product quantity');

    const itemRemoved = await this.deleteCartItem(cartItem.id);

    await this.calcTotalPrice(cart.id);

    if (itemRemoved) return { removed: { name: product.title } };

    return {
      added: { name: product.title, quantity },
      currentQuantity: cartItem.quantity,
    };
  }

  async emptyCart(user: UpdateUserDTO) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: user.id },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { total_price: 0 },
    });

    await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });

    return { message: 'Cart emptied' };
  }

  async getCartItems(user: UpdateUserDTO) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: user.id },
      include: { cartItems: true },
    });

    return cart;
  }

  async calcTotalPrice(cartID: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cart_id: cartID },
    });

    let totalPrice = 0;

    await Promise.all(
      cartItems.map(async (item) => {
        totalPrice += Number(item.price);
      }),
    );

    await this.prisma.cart.update({
      where: { id: cartID },
      data: { total_price: totalPrice },
    });
  }

  async deleteCartItem(cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (cartItem.quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
      return true;
    } else {
      return false;
    }
  }
}
