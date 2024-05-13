import { Controller, Get, Post, Body, Inject, Res, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { IAccountService } from './interfaces/account.service.interface';
import { Account } from './entities/account.entity';
import { TransactionAccountDto } from './dto/transaction-account.dto';
import { ResponseDestinationAccountDto, ResponseOriginAccountDto, ResponseTransferAccountDto } from './dto/response-account.dto';
import { Response } from 'express';

@Controller()
export class AccountController {
  constructor(@Inject(IAccountService) private readonly accountService: IAccountService) { }

  @Post('/event')
  async event(@Res() res: Response, @Body() transaction: TransactionAccountDto) {
    try {
      const result = await this.accountService.executeTransaction(transaction);
      res.status(201).json(result)
    } catch (error) {
      res.status(404).json(0)
    }

  }

  @Get('/balance')
  async find(@Res() res: Response, @Query('account_id') account_id: string) {
    const result = await this.accountService.CheckIfAccount(account_id)

    if (!result) {
      res.status(404).json(0)
    }

    res.status(200).json(result?.balance)
  }

  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Res() res: Response) {
    try {
       await this.accountService.reset()
      res.status(200).send('OK')
    } catch(error) {
      res.status(404).json(0)
    }
    
  }
}
