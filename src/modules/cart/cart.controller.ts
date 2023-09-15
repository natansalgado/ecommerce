import {
  Controller,
  Get,
  Post,
  Delete,
  Request,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addItem(
    @Request() req: express.Request,
    @Body() data: { productId: string; quantity: number },
  ) {
    return this.cartService.addItem(req.user, data.productId, data.quantity);
  }

  @Delete('empty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  emptyCart(@Request() req: express.Request) {
    return this.cartService.emptyCart(req.user);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCartItems(@Request() req: express.Request) {
    return this.cartService.getCartItems(req.user);
  }

  @Get('product/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  productInCart(@Request() req: express.Request, @Param('id') id: string) {
    return this.cartService.productInCart(req.user, id);
  }
}
