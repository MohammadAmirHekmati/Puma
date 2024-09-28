export class InternalErrorResponse {
  code:number
  message:string
  data:Data
}
export class Data {
  code:number
  name:string
  message:string
  stack:any[]
}