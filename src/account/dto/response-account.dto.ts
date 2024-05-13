import { Account } from "../entities/account.entity"

export type ResponseDestinationAccountDto = {
    destination: Account
}

export type ResponseOriginAccountDto = {
    origin: Account
}

export type ResponseTransferAccountDto = {
    origin: Account,
    destination: Account
}