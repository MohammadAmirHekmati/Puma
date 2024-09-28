import { BadRequestException, Injectable } from '@nestjs/common';
import { GetAccountResponse } from '../interfaces/responses/accounts/get-account.response';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { SuggestBrainKeyResponse } from '../interfaces/responses/accounts/suggest-brain-key.response';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';
import { sha512 } from 'js-sha512';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainWalletRepository } from '../repositories/chain-wallet.repository';
import { AccountWithLowerboundAndLimitDto } from '../dto/Account-With-Lowerbound-And-Limit.dto';
import { AccountHistoryDto } from '../dto/account-history.dto';
import { WitnessesListDto } from '../dto/witnesses-list.dto';
import { SetLabelAccountDto } from '../dto/set-label-account.dto';
import { AccountBalanceResponse } from '../interfaces/responses/accounts/account-balance.response';
import { AccountList } from '../interfaces/responses/accounts/accont-list.response';
import { AccountProperties } from '../dto/account-id-by-name.dto';
import { ConvertedAccountInfoRes } from '../interfaces/responses/accounts/converted-account-info.res';
import { AccountHistoryResponse } from '../interfaces/responses/accounts/account-history.response';

@Injectable()
export class PumaAccountService {
  constructor(
    private callrpcService:CallrpcService,
  @InjectRepository(ChainWalletRepository) private readonly pumaWalletRepo:ChainWalletRepository)
  {}

  async publicKeyByAccountName(accountId:string):Promise<string>
  {
    const findUser=await this.pumaWalletRepo.findOne({where:{account_id:accountId}})
    return findUser.public_key
  }

  async getAccountIdByAccountName(accountName: string): Promise<any> {
    const convertToLowercase=accountName.toLowerCase()
    const method = 'get_account';
    const params = [convertToLowercase];
    const sendRequest = await this.callrpcService.pumaWalletCallRpc(method, params);
    if (sendRequest.error) return sendRequest.error;

    const data:GetAccountResponse=sendRequest.result
    return data.id
  }

  async generateBrainKey(): Promise<any> {
    const method = 'suggest_brain_key';
    const params = [];
    const sendRequest = await this.callrpcService.pumaWalletCallRpc(method, params);
    if (sendRequest.error) return sendRequest.error;

    const requestData: SuggestBrainKeyResponse = sendRequest.result;
    return requestData;
  }

  async createWallet(createWalletDto: CreateWalletDto): Promise<any> {
    const { brainKey, accountName } = createWalletDto;
    const lowerAccountName=createWalletDto.accountName.toLowerCase()

    const masterAccount = await this.callrpcService.masterAccountName();

    const method = 'create_account_with_brain_key';
    const params = [`${brainKey}`,`${lowerAccountName}`,`${masterAccount}`, `${masterAccount}`, true];
    const sendRequest = await this.callrpcService.pumaWalletCallRpc(method, params);
  }

  async generateBrainKeyAndCreateAccount(accountName: string): Promise<any> {
    const generateBrainKey: SuggestBrainKeyResponse = await this.generateBrainKey();

    const createWalletDto: CreateWalletDto = { accountName: accountName.toLowerCase(), brainKey: generateBrainKey.brain_priv_key, };

    const createWallet = await this.createWallet(createWalletDto);

    const getAccountId = await this.getAccountIdByAccountName(accountName);

    const pumaWalletEntity = new ChainWalletEntity();
    pumaWalletEntity.account_id = getAccountId;
    pumaWalletEntity.account_name = accountName.toLowerCase();
    pumaWalletEntity.private_key = sha512(generateBrainKey.wif_priv_key + generateBrainKey.wif_priv_key +'private_key');
    pumaWalletEntity.public_key = generateBrainKey.pub_key;
    pumaWalletEntity.brain_key = sha512(generateBrainKey.brain_priv_key + generateBrainKey.brain_priv_key + 'brain_key');
    try {
      const save = await this.pumaWalletRepo.save(pumaWalletEntity);
      return generateBrainKey
    }
    catch (e) {
      console.log(e);
    }
  }

  async accountBalance(accountName: string): Promise<any> {
    const convertToLowerCase=accountName.toLowerCase()
    const method = 'list_account_balances';
    const params = [convertToLowerCase];
    const sendRequest = await this.callrpcService.pumaWalletCallRpc(method, params);

    if (sendRequest.error) return sendRequest.error;

    const data:AccountBalanceResponse[]=sendRequest.result
    return data
  }

  async accountPcoinBalance(accountName:string):Promise<any>
  {
    const accountBalance:AccountBalanceResponse[]=await this.accountBalance(accountName)
   const findPcoinAmount=accountBalance.find(x=>x.asset_id="1.3.0")
    if (findPcoinAmount)
    {
      return findPcoinAmount.amount
    }
  }

  async accountInfo(accountName: string):Promise<any> {
    const convertToLowerCase=accountName.toLowerCase()
    const method = 'get_account';
    const params = [convertToLowerCase];
    const sendRequest = await this.callrpcService.pumaWalletCallRpc(method, params);
    if (sendRequest.error) return sendRequest.error;

    const data:GetAccountResponse=sendRequest.result
    const accountPcoinBalance=await this.accountPcoinBalance(data.name)
    const accountInfo:ConvertedAccountInfoRes=
      {
        accountId:data.id,
        accountName:data.name,
        address:data.options.memo_key,
        totalPcoinBalance:accountPcoinBalance
      }

      return accountInfo
  }

  async listOfAccounts():Promise<any>
  {
    const method="list_my_accounts"
    const params=[]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    const data:AccountList[]=sendRequest.result

    let accounts:ConvertedAccountInfoRes[]=[]
    for (let element of data) {
      const accountPcoinBalance=await this.accountPcoinBalance(element.name)

      const converted:ConvertedAccountInfoRes=
        {
          accountId:element.id,
          accountName:element.name,
          address:element.options.memo_key,
          totalPcoinBalance:accountPcoinBalance
        }


        accounts.push(converted)
    }
    return accounts
  }

  async accountWithLowerboundAndLimit(accountWithLowerboundAndLimitDto:AccountWithLowerboundAndLimitDto):Promise<any>
  {
    const method="list_accounts"
    const params=[`${accountWithLowerboundAndLimitDto.lowerbound}`,accountWithLowerboundAndLimitDto.limit]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }

  async updateLifeTimeMemberAccount(accountName:string):Promise<any>
  {
    const accountBalance:AccountBalanceResponse[]=await this.accountBalance(accountName)
    const findPuma=accountBalance.find(x=>x.asset_id=="1.3.0")
    if (!findPuma)
      throw new BadRequestException(`You don have any PUMA`)
    const pumaWithPercision=findPuma.amount/100000
    if (pumaWithPercision<=4000)
      throw new BadRequestException(`You should have more than 4000 ESC for this Action`)

    const method="upgrade_account"
    const params=[`${accountName}`,true]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }

  async accountHistory(accountHistoryDto:AccountHistoryDto):Promise<any>
  {
    const method="get_account_history"
    const params=[`${accountHistoryDto.accountName}`,accountHistoryDto.limit]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    const data:AccountHistoryResponse[]=sendRequest.result

    let historyDescriptions:string[]=[]
    for (let element of data) {
      historyDescriptions.push(element.description)
    }
    return historyDescriptions
  }

  async witnessesList(witnessesListDto:WitnessesListDto):Promise<any>
  {
    const method="list_witnesses"
    const params=[`${witnessesListDto.lowerbound}`,witnessesListDto.limit]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }

  async setLabelForAccounts(setLabelAccountDto:SetLabelAccountDto):Promise<any>
  {
    const method="set_key_label"
    const params=[`${setLabelAccountDto.publicKey}`,`${setLabelAccountDto.label}`]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }

  async accountCount():Promise<number>
  {
    const method="get_account_count"
    const params=[]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }
}