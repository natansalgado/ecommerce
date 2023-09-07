import {
  Controller,
  Get,
  Post,
  Delete,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { CartService } from './cart.service';
import express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  addItem(
    @Request() req: express.Request,
    @Body() data: { productId: string; quantity: number },
  ) {
    return this.cartService.addItem(req.user, data.productId, data.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('empty')
  emptyCart(@Request() req: express.Request) {
    return this.cartService.emptyCart(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getCartItems(@Request() req: express.Request) {
    return this.cartService.getCartItems(req.user);
  }
}
