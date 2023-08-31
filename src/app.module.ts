import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UserModule, ProductModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
