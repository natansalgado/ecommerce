import {
  Controller,
  Get,
  UseGuards,
  // Param,
  Request as Req,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSalesHistory(@Req() req: Request) {
    return this.saleService.getAllStoreSales(req.user);
  }

  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // getOneSale(@Req() req: Request, @Param('id') id: string) {
  //   //return this.saleService.getOneSale(req.user, id);
  // }
}
