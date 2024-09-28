import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PumaAccountService } from '../services/puma-account.service';
import { AccountWithLowerboundAndLimitDto } from '../dto/Account-With-Lowerbound-And-Limit.dto';
import { AccountHistoryDto } from '../dto/account-history.dto';
import { WitnessesListDto } from '../dto/witnesses-list.dto';
import { SetLabelAccountDto } from '../dto/set-label-account.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStringPipe } from '../pipe/is-string.pipe';

@ApiTags("PUMA Accounts ")
@Controller("puma/account")
export class PumaAccountController {
  constructor(private pumaAccountService: PumaAccountService)
  {}

  @Get('id/by/name')
  async getAccountIdByAccountName(@Query("account_name",IsStringPipe) accountName: string): Promise<any> {
    return await this.pumaAccountService.getAccountIdByAccountName(accountName);
  }

  @Post('create/wallet')
  async generateBrainKeyAndCreateAccount(@Query('account_name',IsStringPipe) accountName: string): Promise<any> {
    return await this.pumaAccountService.generateBrainKeyAndCreateAccount(accountName);
  }

  @Get('account/balance')
  async accountBalance(@Query('account_name',IsStringPipe) accountName: string): Promise<any> {
    return await this.pumaAccountService.accountBalance(accountName);
  }

  @Get('account/info')
  async accountInfo(@Query('account_name',IsStringPipe) accountName: string): Promise<any> {
    return await this.pumaAccountService.accountInfo(accountName);
  }

  @Get("list")
  async listOfAccounts(): Promise<any> {
    return await this.pumaAccountService.listOfAccounts()
  }

  @Post("lowerbound/limit")
  async accountWithLowerboundAndLimit(@Body(ValidationPipe) accountWithLowerboundAndLimitDto: AccountWithLowerboundAndLimitDto): Promise<any> {
    return await this.pumaAccountService.accountWithLowerboundAndLimit(accountWithLowerboundAndLimitDto)
  }

  @Get("upgrade/to/lifetime/member")
  async updateLifeTimeMemberAccount(@Query("account_name",IsStringPipe) accountName: string): Promise<any> {
    return await this.pumaAccountService.updateLifeTimeMemberAccount(accountName)
  }

  @Post("history")
  async accountHistory(@Body(ValidationPipe) accountHistoryDto: AccountHistoryDto): Promise<any> {
    return await this.pumaAccountService.accountHistory(accountHistoryDto)
  }

  @Post("witness/list")
  async witnessesList(@Body(ValidationPipe) witnessesListDto: WitnessesListDto): Promise<any> {
    return await this.pumaAccountService.witnessesList(witnessesListDto)
  }

  @Post("set/label")
  async setLabelForAccounts(@Body(ValidationPipe) setLabelAccountDto:SetLabelAccountDto):Promise<any>
  {
    return await this.pumaAccountService.setLabelForAccounts(setLabelAccountDto)
  }

  @Get("count")
  async accountCount():Promise<any>
  {
    return await this.pumaAccountService.accountCount()
  }
}