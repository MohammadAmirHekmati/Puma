import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChainWalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id:string

  @Column()
  account_id:string

  @Column()
  account_name:string

  @Column()
  public_key:string

  @Column()
  private_key:string

  @Column()
  brain_key:string

  @Column({default:false})
  deleted:boolean
}