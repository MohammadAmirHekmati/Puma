import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';
import { Repository } from 'typeorm';
import { sha512 } from 'js-sha512';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { options } from 'tsconfig-paths/lib/options';
import { SignTransactionResultResponse } from '../interfaces/responses/transactions/sign-transaction-result.response';
import { TransferDto } from '../dto/transfer.dto';
import { TransactionResponse } from '../interfaces/responses/transactions/transaction.response';
import { ChainWalletRepository } from '../repositories/chain-wallet.repository';
import { AccountBalanceResponse } from '../interfaces/responses/accounts/account-balance.response';
import { ChainTransactionRepository } from '../repositories/chain-transaction.repository';
import { ChainTransactionEntity } from '../entities/chain-transaction.entity';
import { PumaAccountService } from './puma-account.service';
import { PumaAssetsService } from './puma-assets.service';
import { TokenInfo } from '../interfaces/Token-Info';
import { TxPreveiwResponse } from '../interfaces/responses/transactions/tx-preveiw.response';
import { InternalErrorResponse } from '../interfaces/internal-error.response/internal-error.response';
import { RpcResponse, RpcResponseError } from 'jsonrpc-ts';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate/index';
import { ConvertedAssetInfoResponse } from '../interfaces/responses/assets/converted-asset-info.response';
import { ChainAssetRepo } from '../repositories/chain-asset.repo';
import { ConvertedAccountInfoRes } from '../interfaces/responses/accounts/converted-account-info.res';
import { AbstractWsAdapter } from '@nestjs/websockets';
import { find } from 'rxjs/operators';
import { WsConvertedResponse } from '../interfaces/responses/websokcet/ws.response';

@Injectable()
export class PumaTransactionService {
  constructor(
    private assetsService:PumaAssetsService,
    private accountService:PumaAccountService,
    private callrpcService:CallrpcService,
              @InjectRepository(ChainWalletRepository) private pumaWalletRepo:ChainWalletRepository,
    @InjectRepository(ChainTransactionRepository) private pumaTransactionRepo:ChainTransactionRepository,
    @InjectRepository(ChainAssetRepo) private pumaAssetRepo:ChainAssetRepo
    )
  {}

  async checkUserBalanceForTransaction(createTransactionDto:CreateTransactionDto):Promise<boolean>
  {
    const assetId:ConvertedAssetInfoResponse=await this.assetsService.assetInfo(createTransactionDto.options.amount.asset)

    const accountBalance:AccountBalanceResponse[]=await this.accountService.accountBalance(createTransactionDto.options.fromAccount)

    const findAssetBalance=await accountBalance.find(x=>x.asset_id==assetId.id)
    if (findAssetBalance.amount<=20)
      throw new BadRequestException(`You must have bigger than 20 of ${createTransactionDto.options.amount.asset}`)

    return true
  }

  async beginBuilderTransaction(): Promise<number>
  {
    const method="begin_builder_transaction"
    const params=[]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    return sendRequest.result
  }

  async setFeeForTransaction(asset_id:string,beginTransactionBuilder:number):Promise<any>
  {
    const tokenId:TokenInfo=await this.assetsService.assetInfo(asset_id)

    const method="set_fees_on_builder_transaction"
    const params=[beginTransactionBuilder,tokenId.id]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    if (sendRequest.error)
      console.log(sendRequest.error);
  }

  async signTransaction(beginTransactionBuilder:number):Promise<any>
  {
    const method="sign_builder_transaction"
    const params=[beginTransactionBuilder,true]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    if (sendRequest.error)
      return sendRequest.error


    return sendRequest.result
  }

  async createTransaction(createTransactionDto:CreateTransactionDto,beginTransactionBuilder:number):Promise<any>
  {
    const fromId=await this.accountService.getAccountIdByAccountName(createTransactionDto.options.fromAccount)
    const toId=await this.accountService.getAccountIdByAccountName(createTransactionDto.options.toAccount)
    const tokenId:ConvertedAssetInfoResponse=await this.assetsService.assetInfo(createTransactionDto.options.amount.asset)
    const method="add_operation_to_builder_transaction"
    const params=[beginTransactionBuilder,[0,{
      from: `${fromId}`,
      to: `${toId}`,
      amount: {
        amount: createTransactionDto.options.amount.amount,
        asset_id: `${tokenId.id}`
      }
    }]]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    if (sendRequest.error)
      console.log(sendRequest.error);
  }

  async checkPrivateKey(createTransactionDto:CreateTransactionDto,privateKey:string):Promise<any>
  {
    const hashedPrivateKey=sha512(privateKey+privateKey+'private_key')
    const findUser=await this.pumaWalletRepo.findOne({where:{private_key:hashedPrivateKey}})
    if (!findUser)
      throw new BadRequestException(`You dont hae wallet yet`)

    if (findUser.account_id!==createTransactionDto.options.fromAccount && findUser.account_name!==createTransactionDto.options.fromAccount)
      throw new BadRequestException(`You dont have permission for this actions`)
  }

  async sendTransaction(createTransactionDto:CreateTransactionDto,privateKey:string):Promise<ChainTransactionEntity>
  {
    const masterAccount=await this.callrpcService.masterAccountName()
    const master=[masterAccount,"1.2.17"]
    if (!master.includes(createTransactionDto.options.fromAccount))
      await this.checkPrivateKey(createTransactionDto,privateKey)

    // await this.checkUserBalanceForTransaction(createTransactionDto)

    const beginTransactionBuilder=await this.beginBuilderTransaction()

    const createTransaction=await this.createTransaction(createTransactionDto,beginTransactionBuilder)

    const setFee=await this.setFeeForTransaction(createTransactionDto.options.amount.asset,beginTransactionBuilder)

    const signTransaction=await this.signTransaction(beginTransactionBuilder)
      if (signTransaction.err)
      {
        return signTransaction.err.message
      }
    else if (signTransaction.signatures)
      {
        const block=signTransaction.ref_block_num
        const txFee:AccountBalanceResponse=signTransaction.operations[0][1].fee
        const txFrom=signTransaction.operations[0][1].from
        const txTo=signTransaction.operations[0][1].to
        const txAmount:AccountBalanceResponse=signTransaction.operations[0][1].amount
        const signatue=signTransaction.signatures[0]

        const pumaTransaction=new ChainTransactionEntity()
        pumaTransaction.builderNumber=beginTransactionBuilder
        pumaTransaction.block=block
        pumaTransaction.feeAmount=txFee.amount
        pumaTransaction.feeAsset=txFee.asset_id
        pumaTransaction.from=txFrom
        pumaTransaction.signature=signatue
        pumaTransaction.to=txTo
        pumaTransaction.txAmount=txAmount.amount
        pumaTransaction.txAsset=txAmount.asset_id
        const save=await this.pumaTransactionRepo.save(pumaTransaction)

        return save
      }
  }

  async transfer(transferDto:TransferDto):Promise<any>
  {
    const method="transfer"
    const params=[`${transferDto.fromAccount}`,`${transferDto.toAccount}`,`${transferDto.amount}`,`${transferDto.assetId}`,`${transferDto.memo}`,true]
    const sendRequest=await this.callrpcService.pumaWalletCallRpc(method,params)
    if (sendRequest.error)
      throw new BadRequestException(sendRequest.error)

    const data:TransactionResponse=sendRequest.result
    return data.operations[0][0].memo
  }

  async previewTransaction(signature:string):Promise<TxPreveiwResponse>
  {
    const findTransaction=await this.pumaTransactionRepo.findOne({where:{signature:signature}})
    if (!findTransaction)
      throw new NotFoundException(`There is No transaction for this txid: ${signature}`)

    const txPreveiwResponse:TxPreveiwResponse=
      {
        block:parseInt(findTransaction.block),
        date:findTransaction.createdAt,
        txAsset:await this.assetsService.assetNameByAssetId(findTransaction.txAsset),
        txAmount:findTransaction.txAmount,
        to:await this.accountService.publicKeyByAccountName(findTransaction.to),
        signature:findTransaction.signature,
        from:await this.accountService.publicKeyByAccountName(findTransaction.from),
        feeAsset:await this.assetsService.assetNameByAssetId(findTransaction.feeAsset),
        feeAmount:findTransaction.feeAmount/100000,
        builderNumber:findTransaction.builderNumber
      }
    return txPreveiwResponse
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async transactionBot()
  {
    const accounts=await this.pumaWalletRepo.find()
    const assets=await this.pumaAssetRepo.find()

    for (let account of accounts)
    {
      const masterAccount=await this.callrpcService.masterAccountName()
      if (account.account_name!=="meta")
      {
        for (let asset of assets) {
          const rndInt = Math.floor(Math.random() * 100) + 20
          const createTransactionDto:CreateTransactionDto=
            {
              options:
                {
                  fromAccount:masterAccount,
                  toAccount:account.account_name,
                  amount:
                    {
                      asset:asset.assetId,
                      amount:rndInt
                    }
                }
            }
          const privateKey=""
          const send=await this.sendTransaction(createTransactionDto,privateKey)
          // console.log(send.signature);
        }
      }
    }
  }

  async lastetBuilderNumber():Promise<ChainTransactionEntity>
  {
   const transactions=await this.pumaTransactionRepo.find()
    return transactions[transactions.length-1]
  }

  async allTransactionPaginate(options:IPaginationOptions):Promise<Pagination<ChainTransactionEntity>>
  {
    return paginate<ChainTransactionEntity>(this.pumaTransactionRepo,options)
  }

  async lastTenPaginate():Promise<WsConvertedResponse[]>
  {
    let i=1
    let lastFiveTransaction:WsConvertedResponse[]=[]

    const transactionCount=await this.pumaTransactionRepo.count()
    const page=transactionCount/10

    const options:IPaginationOptions=
      {
        limit:10,
        page:Math.round(page)
      }

      const paginateTransaction=await paginate<ChainTransactionEntity>(this.pumaTransactionRepo,options)
    for (let element of paginateTransaction.items) {
        const lastTen:WsConvertedResponse=
          {
            builderNumber:element.builderNumber,
            txAsset:await this.assetsService.assetNameByAssetId(element.txAsset),
            txAmount:element.txAmount,
            to:await this.accountService.publicKeyByAccountName(element.to),
            hash:element.signature,
            from:await this.accountService.publicKeyByAccountName(element.from),
            feeAsset:await this.assetsService.assetNameByAssetId(element.feeAsset),
            feeAmount:element.feeAmount/100000,
            block:element.block
          }
        lastFiveTransaction.push(lastTen)
    }
    return lastFiveTransaction
  }
}
