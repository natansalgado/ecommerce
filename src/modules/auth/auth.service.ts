import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return {
          accessToken: this.jwtService.sign({ userId: user.id }),
        };
      }
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  async getProfile(user: UpdateUserDTO) {
    const { id, name, email, address, balance, created_at } = user;
    const userInfos: UpdateUserDTO = {
      id,
      name,
      email,
      address,
      balance,
      created_at,
    };

    return userInfos;
  }
}
