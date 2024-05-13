import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { IAccountService } from './interfaces/account.service.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [
    {
      provide: IAccountService,
      useClass: AccountService
    },
    AccountService
  ],
  controllers: [AccountController],
  exports: [TypeOrmModule, IAccountService]
})
export class AccountModule {}
