export class ResponseDto {
  message: string;
  action: string;
}

export class MainMenuResponse {
  message: string =
    "CON Welcome to USSD Service: #1.Kugura umuriro #2.Kugura airtime #3.Startimes";
  action: string = "FC";
}

export class EntryCachPowerNumberResponse {
  message: string = "Shyiramo nimero ya cashpower #0) Subira inyuma";
  action: string = "FC";
}

export class EntryAmountResponse {
  message: string = "{name} , Shyiramo amafaranga #0) Subira inyuma";
  action: string = "FC";
}
