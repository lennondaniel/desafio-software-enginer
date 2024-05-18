import { Account } from "src/account/entities/account.entity"
import { EntityManager } from "typeorm"

export type TransactionType = 'deposit' | 'transfer' | 'withdraw'
export type EntityManagerType = EntityManager | null
export type ResponseDestinationAccount = { destination: Account}
export type ResponseOriginAccount = { origin: Account }
export type ResponseTransferAccount = { origin: Account, destination: Account }
export type ResponseAccount = ResponseDestinationAccount | ResponseOriginAccount | ResponseTransferAccount

export const isDeposit = (transactionType: TransactionType): transactionType is TransactionType => {
    return transactionType === 'deposit'
}

export const isWithdraw = (transactionType: TransactionType): transactionType is TransactionType => {
    return transactionType === 'withdraw'
}

export const isTransfer = (transactionType: TransactionType): transactionType is TransactionType => {
    return transactionType === 'transfer'
}

