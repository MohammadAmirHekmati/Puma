export class SocketTransactionResponse {
  ref_block_num:number
  ref_block_prefix:number
  expiration:string
  operations:Array<Array<any>>
  extensions:[]
  signatures:string[]
}