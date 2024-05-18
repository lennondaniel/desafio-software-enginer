import { IsNotEmpty, IsOptional } from "class-validator";
import { TransactionType } from "src/types/transaction.types";

export class TransactionAccountDto {
    @IsNotEmpty()
    type: TransactionType
    
    @IsOptional()
    destination?: string

    @IsOptional()
    origin?: string

    @IsNotEmpty()
    amount: number
}
