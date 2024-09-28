import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionAmountDto } from './create-transaction-amount.dto';


export class CreateTransactionOptionsDto {
  @ApiProperty()
  fromAccount:string

  @ApiProperty()
  toAccount:string

  @ApiProperty()
  amount:CreateTransactionAmountDto
}