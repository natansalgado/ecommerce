import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

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

    if (cartItemExists) {
      await this.prisma.cartItem.update({
        where: { id: cartItemExists.id },
        data: { quantity: cartItemExists.quantity + quantity },
      });

      if (
        await this.deleteCartItem(
          cartItemExists.quantity,
          quantity,
          cartItemExists.id,
        )
      ) {
        return { removed: { name: product.title } };
      }
    } else {
      const cartItem = await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productId } },
          quantity,
        },
      });

      if (await this.deleteCartItem(cartItem.quantity, quantity, cartItem.id)) {
        return { removed: { name: product.title } };
      }
    }

    return { added: { name: product.title, quantity } };
  }

  async deleteCartItem(
    currentQuantity: number,
    addQuantity: number,
    cartItemId: string,
  ) {
    if (currentQuantity + addQuantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
      return true;
    } else {
      return false;
    }
  }
}
