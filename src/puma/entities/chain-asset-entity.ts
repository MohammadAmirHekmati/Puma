import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class ChainAssetEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  assetId:string

  @Column()
  expiration:Date

  @Column()
  issuer:string

  @Column()
  symbol:string

  @Column()
  decimal:number

  @Column()
  maxSupply:string

  @Column()
  description:string

  @Column()
  signature:string

}