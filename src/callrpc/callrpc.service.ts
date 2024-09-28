import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcClient, RpcClientOptions, RpcRequest, RpcResponse } from 'jsonrpc-ts';
import { InternalErrorResponse } from '../puma/interfaces/internal-error.response/internal-error.response';



@Injectable()
export class CallrpcService {

  async pumaWalletRpcOptions():Promise<RpcClientOptions>
  {

    const HOST="http://176.9.7.18"
    const PORT=12012

    const pumaRpcOptions:RpcClientOptions=
      {
        url:`${HOST}:${PORT}/rpc`,
        timeout:60000,
        headers:{"content-type": "text/plain;"},
        method:"post"
      }
      return pumaRpcOptions
  }

  async pumaBlockchainRpcOptions():Promise<RpcClientOptions>
  {

    const HOST="http://176.9.7.18"
    const PORT=12011

    const pumaRpcOptions:RpcClientOptions=
      {
        url:`${HOST}:${PORT}/rpc`,
        timeout:60000,
        headers:{"content-type": "text/plain;"},
        method:"post"
      }
    return pumaRpcOptions
  }

  async pumaWalletCallRpc(method:string,params:any[]):Promise<RpcResponse<any>>
  {
    const rpcOptions=await this.pumaWalletRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const randomId=Math.floor(Math.random() * 99999 - 11111)
    const rpcRequest:RpcRequest<any>=
      {
        id:randomId,
        jsonrpc:"2.0",
        method:method,
        params:params
      }
      try {
        const sendRequest=await rpcClient.makeRequest(rpcRequest)
        return sendRequest.data
      }
      catch (error) {
        const catchError:InternalErrorResponse=error
        const errorResult:RpcResponse<any>=
          {
            jsonrpc:"2.0",
            id:randomId,
            error:catchError
          }
          return errorResult
      }
  }

  async pumaBlockchainCallRpc(method:string,params:any[]):Promise<RpcResponse<any>>
  {
    const rpcOptions=await this.pumaBlockchainRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id:Math.floor(Math.random() * 99999 - 11111),
        jsonrpc:"2.0",
        method:method,
        params:params
      }
    const sendRequest=await rpcClient.makeRequest(rpcRequest)
    return sendRequest.data
  }

  async masterAccountName():Promise<string>
  {
    const masterAccount="meta"
    return masterAccount
  }
}
