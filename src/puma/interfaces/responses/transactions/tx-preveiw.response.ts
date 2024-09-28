import { Column } from 'typeorm';

export class TxPreveiwResponse {
  block:number

  date:Date

  builderNumber:number

  feeAmount:number

  feeAsset:string

  from:string

  to:string

  txAmount:number

  txAsset:string

  signature:string
}