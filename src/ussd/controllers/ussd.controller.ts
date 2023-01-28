import { Body, Controller, Get, Query } from "@nestjs/common";
import { UssdService } from "../services/ussd.service";
@Controller("/api/ussd")
export class UssdController {
  constructor(private readonly service: UssdService) {}

  @Get()
  public async handleUSSDRequest(@Body() query: any) {
    return this.service.handlerMenus(query);
  }
}
