import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError)
      throw new UnauthorizedException('Invalid Token');

    return super.handleRequest(err, user, info, context, status);
  }
}
