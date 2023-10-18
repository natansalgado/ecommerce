import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request as Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: Request) {
    const user = req.user as User;

    if (!user.admin) {
      throw new UnauthorizedException('you are not allowed to do this');
    }

    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;

    if (!user.admin) {
      throw new UnauthorizedException('you are not allowed to do this');
    }

    return this.userService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserDTO,
    @Req() req: Request,
  ) {
    const user = req.user as User;

    if (!(user.id === id || user.admin))
      throw new UnauthorizedException('you are not allowed to do this');

    return this.userService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Req() req: Express.Request, @Param('id') id: string) {
    const user = req.user as User;

    if (!(user.id === id || user.admin))
      throw new UnauthorizedException('you are not allowed to do this');

    return this.userService.delete(id);
  }
}
