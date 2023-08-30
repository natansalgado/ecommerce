import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/PrismaService';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
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

  async update(id: string, data: Prisma.UserUpdateInput) {
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
