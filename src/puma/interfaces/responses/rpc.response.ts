export class RpcResponse {
  id:string | number | null
  jsonrpc:string
  result?:Object
  error?:RpcErrorResponse
}

export class RpcErrorResponse {
  code:number
  message:string
  data:Object
}