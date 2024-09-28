import { Body, Controller, Get, ParseIntPipe, Post, Query, Sse, ValidationPipe } from '@nestjs/common';
import { PumaService } from '../services/puma.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { from, interval, map, Observable, of, pipe } from 'rxjs';
import { TransferDto } from '../dto/transfer.dto';

@ApiTags('PUMA ')
@Controller('puma')
export class PumaController {
  constructor(private pumaService: PumaService) {}

  @Get('block')
  async getBlockByNumber(@Query('block_number') blockNumber: number): Promise<any>
  {
    return await this.pumaService.getBlockByNumber(blockNumber);
  }

  @Get("block/transactions")
  async blockTransactions(@Query('block_number',ParseIntPipe) blockNumber: number):Promise<any>
  {
    return await this.pumaService.blockTransactions(blockNumber)
  }
  @Get("account/count/transaction/count")
  async accountCountAndTransactionCount():Promise<any>
  {
    return await this.pumaService.accountCountAndTransactionCount()
  }
}
