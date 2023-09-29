import {
  Controller,
  Post,
  Get,
  UseGuards,
  Param,
  Body,
  Request as Req,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createStore(@Req() req: Request, @Body() { name }: { name: string }) {
    return this.storeService.createStore(req.user, name);
  }

  @Get()
  getAllStores() {
    return this.storeService.getAllStores();
  }

  @Get('mystore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyStore(@Req() req: Request) {
    return this.storeService.getMyStore(req.user);
  }

  @Get(':id')
  getOneStore(@Param('id') id: string) {
    return this.storeService.getOneStore(id);
  }
}
