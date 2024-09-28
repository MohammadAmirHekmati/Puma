import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PumaTransactionService } from '../services/puma.transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransferDto } from '../dto/transfer.dto';
import { ChainTransactionEntity } from '../entities/chain-transaction.entity';
import { Pagination } from 'nestjs-typeorm-paginate/index';
import { IsStringPipe } from '../pipe/is-string.pipe';

@ApiTags("PUMA Transaction")
@Controller("puma/transaction")
export class PumaTransactionController {
  constructor(private pumaTransactionService:PumaTransactionService)
  {}

  @Post('send/transaction')
  async sendTransaction(@Body(ValidationPipe) createTransactionDto: CreateTransactionDto ,@Query("private_key",IsStringPipe) privateKey:string): Promise<any>
  {
    return await this.pumaTransactionService.sendTransaction(createTransactionDto,privateKey);
  }

  @Post("transfer")
  async transfer(@Body(ValidationPipe) transferDto:TransferDto):Promise<any>
  {
    return this.pumaTransactionService.transfer(transferDto)
  }

  @Get("preveiw")
  async previewTransaction(@Query("txId",IsStringPipe) signature:string):Promise<any>
  {
    return await this.pumaTransactionService.previewTransaction(signature)
  }

  @Get("lastest/transaction")
  async lastetBuilderNumber():Promise<ChainTransactionEntity>
  {
    return await this.pumaTransactionService.lastetBuilderNumber()
  }

  @Get("all/paginate")
  async allTransactionPaginate(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10):Promise<Pagination<ChainTransactionEntity>>
  {
    limit = limit > 100 ? 100 : limit;
    return this.pumaTransactionService.allTransactionPaginate({page,limit})
  }

  @Get("last/ten")
  async lastTenPaginate():Promise<any>
  {
    return await this.pumaTransactionService.lastTenPaginate()
  }
}