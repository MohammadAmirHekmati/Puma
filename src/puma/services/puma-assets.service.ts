import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { TokenInfo } from '../interfaces/Token-Info';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { AssetInfoResponse } from '../interfaces/responses/assets/asset-info.response';
import { ConvertedAssetInfoResponse } from '../interfaces/responses/assets/converted-asset-info.response';
import { ConvertedCreateAssetResponse } from '../interfaces/responses/assets/converted-create-asset.response';
import { CreateAssetResponse } from '../interfaces/responses/assets/create-asset.response';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainWalletRepository } from '../repositories/chain-wallet.repository';
import { ChainAssetEntity } from '../entities/chain-asset-entity';
import { ChainAssetRepo } from '../repositories/chain-asset.repo';
import { IssueAssetDto } from '../dto/issue-asset.dto';
import { PumaAccountService } from './puma-account.service';
import { ConvertedAccountInfoRes } from '../interfaces/responses/accounts/converted-account-info.res';
import { AccountBalanceResponse } from '../interfaces/responses/accounts/account-balance.response';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';
import { TokenHoldersInterface } from '../interfaces/token-holders.interface';
import { createReadStream } from 'fs';
import { find } from 'rxjs/operators';

@Injectable()
export class PumaAssetsService {
  constructor(private callrpcService:CallrpcService,
              private accountService:PumaAccountService,
              @InjectRepository(ChainAssetRepo) private readonly pumaAssetRepo:ChainAssetRepo,
              @InjectRepository(ChainWalletRepository) private readonly pumaWalletRepo:ChainWalletRepository
              )
  {}

  async assetNameByAssetId(assetId:string):Promise<string>
  {
    const assetInfo:ConvertedAssetInfoResponse=await this.assetInfo(assetId)
    return assetInfo.symbol
  }

  async getAssetList(): Promise<any>
  {
    const method = 'list_assets';
    const params = ['', 100];
    const callRpc = await this.callrpcService.pumaWalletCallRpc(method, params);
    if (callRpc.error) throw new BadRequestException(callRpc.error);

    const tokenList: TokenInfo[] = callRpc.result;
    const convertedInfo:ConvertedAssetInfoResponse[]=[]

    for (let token of tokenList) {
      const converted:ConvertedAssetInfoResponse=
        {
          id:token.id,
          symbol:token.symbol,
          decimal:token.precision,
          issuer:token.issuer,
          maxSupply:token.options.max_supply
        }
        convertedInfo.push(converted)
    }
    return convertedInfo
  }

  async createAsset(createAssetDto:CreateAssetDto):Promise<any>
  {
    const masterAccount=await this.callrpcService.masterAccountName()
    const accountMemo:ConvertedAccountInfoRes=await this.accountService.accountInfo(masterAccount)
    const method="create_asset"
    const params=[`${masterAccount}`,`${createAssetDto.symbol}`,createAssetDto.decimal,
      {"blacklist_authorities":[],
        "blacklist_markets":[],
        "core_exchange_rate":{"base":{"amount":10,"asset_id":"1.3.0"},
          "quote":{"amount":10,"asset_id":"1.3.1"}},
        "description":`${createAssetDto.description}`,
        "flags":0,"issuer_permissions":79,
        "market_fee_percent":0,
        "max_market_fee":0,
        "max_supply":createAssetDto.maxSupply,
        "whitelist_authorities":[],
        "whitelist_markets":[]},null,true]

    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    const data:CreateAssetResponse=sendRequest.result
    const assetInfo=await this.assetInfo(data.operations[0][1].symbol)
    const issueAssetDto:IssueAssetDto=
      {
        issueMemo:accountMemo.address,
        assetId:assetInfo.id,
        amount:(data.operations[0][1].common_options.max_supply/100000).toString(),
        issuerAccount:data.operations[0][1].issuer
      }
      const issueAsset=await this.issueAsset(issueAssetDto)

    const pumaAsset=new ChainAssetEntity()
    pumaAsset.assetId=assetInfo.id
    pumaAsset.decimal=data.operations[0][1].precision
    pumaAsset.description=data.operations[0][1].common_options.description
    pumaAsset.expiration=data.expiration
    pumaAsset.issuer=data.operations[0][1].issuer
    pumaAsset.maxSupply=data.operations[0][1].common_options.max_supply
    pumaAsset.signature=data.signatures[0]
    pumaAsset.symbol=data.operations[0][1].symbol
    const saved=await this.pumaAssetRepo.save(pumaAsset)
    delete saved.id
      return saved
  }

  async assetInfo(asset:string):Promise<any>
  {
    const assetUppercase=asset.toUpperCase()
    const method="get_asset"
    const params=[`${assetUppercase}`]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    const data:AssetInfoResponse=sendRequest.result
    const issuerInfo:ConvertedAccountInfoRes=await this.accountService.accountInfo(data.issuer)
    const converted:ConvertedAssetInfoResponse=
      {
        id:data.id,
        symbol:data.symbol,
        decimal:data.precision,
        issuer:issuerInfo.address,
        maxSupply:data.options.max_supply
      }

      return converted
  }

  async issueAsset(issueAssetDto:IssueAssetDto):Promise<any>
  {
    const method="issue_asset"
    const params=[`${issueAssetDto.issuerAccount}`,`${issueAssetDto.amount}`,`${issueAssetDto.assetId}`,`${issueAssetDto.issueMemo}`,true]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
  }

  async tokenHolders(symbol:string):Promise<TokenHoldersInterface[]>
  {
    let tokenHolders:TokenHoldersInterface[]=[]

      const accounts=await this.pumaWalletRepo.find()
    const symbolId:ConvertedAssetInfoResponse=await this.assetInfo(symbol)
    for (let account of accounts)
    {
      const accountBalance:AccountBalanceResponse[]=await this.accountService.accountBalance(account.account_name)
      const findSymbol=accountBalance.find(x=>x.asset_id==symbolId.id)
      if (findSymbol)
      {
        const maxSupply=parseInt(symbolId.maxSupply)
        const userAmount=findSymbol.amount
        const percentage=(userAmount/maxSupply)*100
        const holders:TokenHoldersInterface=
          {
            address:account.public_key,
            accountName:account.account_name,
            percentage:percentage
          }

          tokenHolders.push(holders)
      }
    }

    return tokenHolders
  }

  async tokenPhotos(symbol:string,res):Promise<any>
  {
    const response=res.sendFile(process.cwd()+`/photos/${symbol}.png`)
    return response
  }
}