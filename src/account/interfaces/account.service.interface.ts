
import { 
    ResponseDestinationAccountDto, 
    ResponseOriginAccountDto, 
    ResponseTransferAccountDto 
} from "../dto/response-account.dto"
import { TransactionAccountDto } from "../dto/transaction-account.dto"
import { Account } from "../entities/account.entity"

export interface IAccountService {
    executeTransaction(transaction: TransactionAccountDto): Promise<
    ResponseDestinationAccountDto | 
    ResponseOriginAccountDto | 
    ResponseTransferAccountDto>
    CheckIfAccount(id: string): Promise<Account | null>
    reset(): Promise<void>
}

export const IAccountService = Symbol('IAccountService')