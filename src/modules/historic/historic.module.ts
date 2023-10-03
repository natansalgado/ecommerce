import { Module } from '@nestjs/common';
import { HistoricService } from './historic.service';
import { HistoricController } from './historic.controller';
import { PrismaService } from '../../database/PrismaService';

@Module({
  controllers: [HistoricController],
  providers: [HistoricService, PrismaService],
})
export class HistoricModule {}
