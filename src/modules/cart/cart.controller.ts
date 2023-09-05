import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
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
}
