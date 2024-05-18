
import { ResponseAccount } from "src/types/transaction.types"
import { TransactionAccountDto } from "../dto/transaction-account.dto"
import { Account } from "../entities/account.entity"

export interface IAccountService {
    executeTransaction(transaction: TransactionAccountDto): Promise<ResponseAccount>
    findAccountById(id: string): Promise<Account | null>
    reset(): Promise<void>
}

export const IAccountService = Symbol('IAccountService')