import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { IAccountService } from './interfaces/account.service.interface';
import { TransactionAccountDto } from './dto/transaction-account.dto';
import { ResponseDestinationAccountDto, ResponseOriginAccountDto, ResponseTransferAccountDto } from './dto/response-account.dto';

enum TransactionType {
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  WITHDRAW = 'withdraw'
}

@Injectable()
export class AccountService implements IAccountService {

  constructor(@InjectRepository(Account) readonly accountRepository: Repository<Account>) { }
  async executeTransaction(transaction: TransactionAccountDto): Promise<ResponseDestinationAccountDto | ResponseOriginAccountDto | ResponseTransferAccountDto> {
    if (TransactionType.DEPOSIT == transaction.type) {
      let account = await this.CheckIfAccount(transaction.destination)
      if (!account) {
        const newAccount = await this.createAccount(transaction.destination, transaction.amount)
        return { destination: newAccount }
      }

      const result = await this.updateBalance(account, transaction)
      return { destination: result }
    }

    if (TransactionType.WITHDRAW == transaction.type) {
      let account = await this.CheckIfAccount(transaction.origin)
      if (!account) {
        throw new Error('Account not found')
      }

      const result = await this.updateBalance(account, transaction)
      return { origin: result }
    }

    if (TransactionType.TRANSFER == transaction.type) {
      const originAccount = await this.CheckIfAccount(transaction.origin)
      let destinationAccount = await this.CheckIfAccount(transaction.destination)
      if (!originAccount) {
        throw new Error('Origin account not found')
      }
      if(!destinationAccount) {

        destinationAccount = await this.createAccount(transaction.destination, 0)
      }

      return await this.transferValue(originAccount, destinationAccount, transaction.amount)
    }

    throw new Error('Type transaction not found')
  }

  async CheckIfAccount(id: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { id: id } })

    if (account) {
      return account
    }

    return null
  }

  async createAccount(id: string, balance: number): Promise<Account> {
    const accountCreated = this.accountRepository.create({id: id, balance: balance})

    return await this.accountRepository.save(accountCreated)
  }

  private async transferValue(origin: Account, destination: Account, amount: number): Promise<{origin: Account, destination: Account}> {
    if(origin.balance < amount) {
      throw new Error('Insufficient balance')
    }

    origin.balance -= amount
    destination.balance += amount
    const originRes = await this.accountRepository.save(origin)
    const destinationRes = await this.accountRepository.save(destination)
    return Promise.resolve({ origin: originRes, destination: destinationRes })
  }

  private async updateBalance(account: Account, transaction: TransactionAccountDto): Promise<Account> {
    if (TransactionType.DEPOSIT == transaction.type) {
      account.balance += transaction.amount
    }
    if (TransactionType.WITHDRAW == transaction.type) {
      if(account.balance < transaction.amount) {
        throw new Error('Insufficient balance')
      }
      account.balance -= transaction.amount
    }

    return await this.accountRepository.save(account)
  }

  async reset(): Promise<void> {
    await this.accountRepository.delete({})
  }
}
