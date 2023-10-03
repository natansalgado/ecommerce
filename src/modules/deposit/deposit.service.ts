import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class DepositService {
  constructor(private prisma: PrismaService) {}

  async deposit(user: UpdateUserDTO, value: number) {
    if (value < 10)
      throw new BadRequestException('The minimum deposit value is R$ 10.00');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: value } },
    });

    return {
      added: {
        user: updatedUser.name,
        value: value.toFixed(2),
        currentBalance: updatedUser.balance,
      },
    };
  }

  async reset(user: UpdateUserDTO, id: string) {
    if (!user.admin)
      throw new UnauthorizedException(
        'You need to be a admin to reset a user balance',
      );

    const userToReset = await this.prisma.user.findUnique({ where: { id } });

    if (!userToReset) throw new NotFoundException('User not found');

    await this.prisma.user.update({ where: { id }, data: { balance: 0 } });

    return { reseted: userToReset.name };
  }
}
