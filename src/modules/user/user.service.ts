import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    if (data.password.length < 8)
      throw new Error('Password must be at least 8 characters long');

    const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);

    data.password = hashedPassword;
    data.balance = 0;

    const userExists = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (userExists) throw new Error('Email already in use');

    return await this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new Error("User doesn't exists");

    return userExists;
  }

  async update(id: string, data: UpdateUserDTO) {
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);
      data.password = hashedPassword;
    }

    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new Error("User doesn't exists");

    return await this.prisma.user.update({ data, where: { id } });
  }

  async delete(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) throw new Error("User doesn't exists");

    await this.prisma.user.delete({ where: { id } });

    return { success: `User '${userExists.name}' deleted` };
  }
}
