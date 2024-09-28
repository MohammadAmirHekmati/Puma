import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get("api/test")
  async testApi():Promise<any>
  {
    const apiIsOk=
      {
        test:"Api Is OK"
      }
      return apiIsOk
  }
}