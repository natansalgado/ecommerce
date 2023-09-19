import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { HistoricModule } from './modules/historic/historic.module';
import { StoreModule } from './modules/store/store.module';
import { DepositModule } from './modules/deposit/deposit.module';

@Module({
  imports: [UserModule, ProductModule, AuthModule, CartModule, HistoricModule, StoreModule, DepositModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
