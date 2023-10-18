import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Decimal } from '@prisma/client/runtime/library';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    const validPassword = await this.validatePassword(data.password);

    if (!validPassword)
      throw new NotAcceptableException(
        'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
      );

    const validEmail = await this.validateEmail(data.email);

    if (!validEmail) throw new NotAcceptableException('Use a valid Email');

    const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);

    data.password = hashedPassword;
    data.balance = new Decimal(0);
    data.admin = false;

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userExists) throw new ConflictException('Email already in use');

    const user = await this.prisma.user.create({
      data,
    });

    const cart = await this.prisma.cart.create({ data: { user_id: user.id } });

    return { ...user, cart };
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new NotFoundException("User doesn't exists");

    return userExists;
  }

  async update(id: string, data: UpdateUserDTO) {
    const validPassword = await this.validatePassword(data.password);

    if (!validPassword && data.password)
      throw new NotAcceptableException(
        'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
      );

    if (!data.password) data.password = undefined;

    const validEmail = await this.validateEmail(data.email);

    if (!validEmail) throw new NotAcceptableException('Use a valid Email');

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);
      data.password = hashedPassword;
    }

    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new NotFoundException("User doesn't exists");

    return await this.prisma.user.update({ data, where: { id } });
  }

  async delete(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new NotFoundException("User doesn't exists");

    await this.prisma.user.delete({ where: { id } });
    return { success: `User '${userExists.name}' deleted` };
  }

  async validateEmail(email: string) {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  }

  async validatePassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }
}
