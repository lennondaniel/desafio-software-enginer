import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { IAccountService } from './interfaces/account.service.interface';
import { TransactionAccountDto } from './dto/transaction-account.dto';
import {
  EntityManagerType,
  ResponseAccount, 
  ResponseDestinationAccount, 
  ResponseOriginAccount, 
  ResponseTransferAccount, 
  TransactionType, 
  isDeposit, 
  isTransfer, 
  isWithdraw
} from '../types/transaction.types';

@Injectable()
export class AccountService implements IAccountService {

  constructor(@InjectRepository(Account) readonly accountRepository: Repository<Account>) { }

  async executeTransaction(transaction: TransactionAccountDto): Promise<ResponseAccount> {
    if (isDeposit(transaction.type)) {
      return this.handleDeposit(transaction)
    }

    if (isWithdraw(transaction.type)) {
      return this.handleWithdraw(transaction)
    }

    if (isTransfer(transaction.type)) {
      return this.handleTransfer(transaction)
    }

    throw new Error('Type transaction not found')
  }

  private async handleDeposit(transaction: TransactionAccountDto): Promise<ResponseDestinationAccount> {
    let account = await this.findAccountById(transaction.destination)

    if (!account) {
      account = await this.createAccount(transaction.destination, transaction.amount)
    } else {
      account = await this.updateAmount(account, 'deposit', transaction.amount)
    }

    return { destination: account }
  }

  private async handleWithdraw(transaction: TransactionAccountDto): Promise<ResponseOriginAccount> {
    const account = await this.findAccountById(transaction.origin)
    if (!account) {
      throw new Error('Account not found')
    }

    const result = await this.updateAmount(account, 'withdraw', transaction.amount)
    return { origin: result }
  }

  private async handleTransfer(transaction: TransactionAccountDto): Promise<ResponseTransferAccount> {
    const originAccount = await this.findAccountById(transaction.origin)
    let destinationAccount = await this.findAccountById(transaction.destination)
    if (!originAccount) {
      throw new Error('Origin account not found')
    }
    if (!destinationAccount) {
      destinationAccount = await this.createAccount(transaction.destination, 0)
    }

    return await this.transferAmount(originAccount, destinationAccount, transaction.amount)
  }

  async findAccountById(id: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { id: id } })

    if (account) {
      return account
    }

    return null
  }

  async createAccount(id: string, balance: number): Promise<Account> {
    const accountCreated = this.accountRepository.create({ id: id, balance: balance })

    return await this.accountRepository.save(accountCreated)
  }

  private async transferAmount(origin: Account, destination: Account, amount: number): Promise<ResponseTransferAccount> {
    if (!this.hasSufficientBalance(origin, amount)) {
      throw new Error('Insufficient balance')
    }

    return await this.accountRepository.manager.transaction(async (entityManager) => {
      const originUpdated = await this.updateAmount(origin, 'withdraw', amount, entityManager, true)
      const destinationUpdated = await this.updateAmount(destination, 'deposit', amount, entityManager, true)

      return { origin: originUpdated, destination: destinationUpdated }
    })
  }

  private async updateAmount(
    account: Account,
    type: TransactionType,
    amount: number,
    entityManager: EntityManagerType = null,
    useTransaction: boolean = false
  ): Promise<Account> {
    if (!isDeposit(type) && !isWithdraw(type)) {
      throw new Error('Invalid transaction type')
    }

    if (isDeposit(type)) {
      this.updateDepositAmount(account, amount)
    } else {
      this.updateWithdrawAmount(account, amount)
    }

    if (useTransaction) {
      return await entityManager.save(account)
    }

    return this.accountRepository.save(account)
  }

  private updateDepositAmount(account: Account, amount: number): void {
    account.balance += amount
  }

  private updateWithdrawAmount(account: Account, amount: number): void {
    if (!this.hasSufficientBalance(account, amount)) {
      throw new Error('Insufficient balance')
    }
    account.balance -= amount
  }

  private hasSufficientBalance(account: Account, amount: number): boolean {
    return account.balance >= amount
  }

  async reset(): Promise<void> {
    await this.accountRepository.delete({})
  }
}
