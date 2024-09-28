import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  const config = new DocumentBuilder()
    .setTitle('PUMA')
    .setDescription('The PUMA API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000).then(()=>{
    console.log(`PUMA Swagger Running on : http://localhost:3000/docs/`);
  });
}
bootstrap();
