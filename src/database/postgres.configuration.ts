import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfiguration implements TypeOrmOptionsFactory{
  createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const options:TypeOrmModuleOptions=
      {
        type : "postgres" ,
        host : "188.40.151.157" ,
        port : 5432 ,
        username : "postgres" ,
        password : "8M0!Mri9rX" ,
        database : "puma" ,
        autoLoadEntities:true,
        synchronize : true
      }
      return options
  }

}