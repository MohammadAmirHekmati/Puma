import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChainTransactionEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column({nullable:true})
  @Index()
  builderNumber:number

  @Column()
  feeAmount:number

  @Column()
  feeAsset:string

  @Column()
  from:string

  @Column({nullable:true})
  block:string

  @Column()
  to:string

  @Column()
  txAmount:number

  @Column()
  txAsset:string

  @Column()
  signature:string

  @CreateDateColumn()
  createdAt:Date
}