import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Request as Req,
} from '@nestjs/common';
import { HistoricService } from './historic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('historic')
export class HistoricController {
  constructor(private readonly historicService: HistoricService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() req: Request) {
    return this.historicService.create(req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUserHistorics(@Req() req: Request) {
    return this.historicService.getUserHistorics(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getOneHistoric(@Req() req: Request, @Param('id') id: string) {
    return this.historicService.getOneHistoric(req.user, id);
  }
}
