import {
  Controller,
  UseGuards,
  Post,
  Delete,
  Param,
  Body,
  Request as Req,
} from '@nestjs/common';
import { DepositService } from './deposit.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createStore(@Req() req: Request, @Body() { value }: { value: number }) {
    return this.depositService.deposit(req.user, value);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reset(@Req() req: Request, @Param('id') id: string) {
    return this.depositService.reset(req.user, id);
  }
}
