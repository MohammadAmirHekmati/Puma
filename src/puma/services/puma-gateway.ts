import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Socket,Server} from 'socket.io'
import { Logger } from '@nestjs/common';
import { SocketTransactionResponse } from '../interfaces/responses/transactions/socket-transaction-response';
import { AccountBalanceResponse } from '../interfaces/responses/accounts/account-balance.response';
import { WsConvertedResponse } from '../interfaces/responses/websokcet/ws.response';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainWalletRepository } from '../repositories/chain-wallet.repository';
import { PumaAssetsService } from './puma-assets.service';
import { AssetInfoResponse } from '../interfaces/responses/assets/asset-info.response';
import { ChainTransactionRepository } from '../repositories/chain-transaction.repository';
const {Apis}=require("bitsharesjs-ws")

@WebSocketGateway({cors:true})
export class PumaGateway implements OnGatewayInit,OnGatewayDisconnect,OnGatewayConnection{
  constructor(
    @InjectRepository(ChainWalletRepository) private readonly pumaWalletRepo:ChainWalletRepository,
    @InjectRepository(ChainTransactionRepository) private readonly pumaTransactionRepo:ChainTransactionRepository,
    private assetsService:PumaAssetsService
  )
  {}

  @WebSocketServer() wss:Server
  logger=new Logger()

  afterInit(server:Server): any
  {
    this.logger.log("Gateway Running...!")
  }

  handleConnection(client:Socket, ...args: any[]): any
  {
    this.logger.warn(`Client Connected...!  ${client.id}`)
  }

  handleDisconnect(client: Socket): any
  {
    this.logger.debug(client.connected)
    this.logger.error(`Client disconnected...!  ${client.id}`)
  }

  async transactionBeginBuilder(hash:string):Promise<number>
  {
    const findTransaction=await this.pumaTransactionRepo.findOne({where:{signature:hash}})
    return findTransaction.builderNumber
  }

  async accountPublicKey(accountId:string):Promise<string>
  {
    try {
      const findAccount=await this.pumaWalletRepo.findOne({where:{account_id:accountId}})
      return findAccount.public_key
    }catch (e) {
      this.logger.warn(e)
    }

  }

  async assetNameById(assetId:string):Promise<string>
  {
    const findAsset:AssetInfoResponse=await this.assetsService.assetInfo(assetId)
    return findAsset.symbol
  }

  @SubscribeMessage("pumaTransaction")
  async sendTransactions(client:Socket, text:string)
  {
    if (text)
    {
      let paginateTransactions:WsConvertedResponse[]=[]

      Apis.instance("http://176.9.7.18:12011", true).init_promise.then(async (res) => {

        const getBlock=await Apis.db.set_pending_transaction_callback(async (trx:SocketTransactionResponse[])=>{
          const block=trx[0].ref_block_num
          const txFee:AccountBalanceResponse=trx[0].operations[0][1].fee
          const txFrom=trx[0].operations[0][1].from
          const txTo=trx[0].operations[0][1].to
          const txAmount:AccountBalanceResponse=trx[0].operations[0][1].amount
          const signatue=trx[0].signatures[0]
          const wsConvertedResponse:WsConvertedResponse=
            {
              block:block,
              feeAmount:txFee.amount/100000,
              feeAsset:await this.assetNameById(txFee.asset_id),
              from:await this.accountPublicKey(txFrom),
              hash:signatue,
              to:await this.accountPublicKey(txTo),
              txAmount:txAmount.amount,
              txAsset:await this.assetNameById(txAmount.asset_id),
              builderNumber:await this.transactionBeginBuilder(signatue)
            }

          if (paginateTransactions.length==10)
          {
            paginateTransactions.unshift(wsConvertedResponse)
            paginateTransactions.pop()
            this.wss.emit("msgToClient",paginateTransactions)
          }
          else if (paginateTransactions.length<10)
          {
            paginateTransactions.push(wsConvertedResponse)
            this.wss.emit("msgToClient",paginateTransactions)
          }},false)
      });
    }
  }
}