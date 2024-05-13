import { IsNotEmpty, IsOptional } from "class-validator";

export class TransactionAccountDto {
    @IsNotEmpty()
    type: string
    
    @IsOptional()
    destination?: string

    @IsOptional()
    origin?: string

    @IsNotEmpty()
    amount: number
}
