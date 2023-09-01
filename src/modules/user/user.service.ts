import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(data.password))
      throw new NotAcceptableException(
        'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
      );

    const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);

    data.password = hashedPassword;
    data.balance = 0;

    const userExists = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (userExists) throw new ConflictException('Email already in use');

    return await this.prisma.user.create({
      data,
    });
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
}
