import { Body, Controller, Get, Query } from "@nestjs/common";
import { UssdService } from "../services/ussd.service";
@Controller("/api/ussd")
export class UssdController {
  constructor(private readonly service: UssdService) {}

  @Get()
  public async handleUSSDRequest(@Query() req:any) {
    // console.log(req)
    return this.service.handlerMenus(req);
  }
}