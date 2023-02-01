export class ResponseDto {
  public static mainMenuResponse = {
    message:
      "CON Welcome to USSD Service: #1.Kugura umuriro #2.Kugura airtime #3.Startimes",
    action: "FC",
  };
  public static entryCachPowerNumberResponseScreen = {
    message: "Shyiramo nimero ya cashpower #0) Subira inyuma #*) Ahabanza",
    action: "FC",
  };

  public static failedCachPowerNumberResponseScreen = {
    message: "nimero siyo,ongera uyishyiremo neza #*) Ahabanza",
    action: "FC",
  };

  public static invalidAmountResponseScreen = {
    message:
      "amafaranga yemewe ni 100-250000,ongera ushyiremo amafaranga #*) Ahabanza",
    action: "FC",
  };

  public static invalidStartimesAmountResponseScreen = {
    message:
      "amafaranga yemewe ni 500-50000,ongera ushyiremo amafaranga #*) Ahabanza",
    action: "FC",
  };

  public static chooseCellProviderResponseScreen = {
    message: "hitamo 1.Mtn #2.Airtel #0).gusubira inyuma  #*) Ahabanza",
    action: "FC",
  };
  public static entryPhoneNumberResponseScreen = {
    message: "Shyiramo nimero yakira Airtime #0) Subira inyuma  #*) Ahabanza",
    action: "FC",
  };
  public static entryStartimesNumberResponseScreen = {
    message: "Shyiramo nimero y'ifatabuguzi #0) Subira inyuma  #*) Ahabanza",
    action: "FC",
  };
  public static failedStartimesNumberResponseScreen = {
    message: "washyizemo nimero itariyo,ongera uyishyiremo neza #*) Ahabanza",
    action: "FC",
  };

  public static invalidPhoneNumberResponseScreen = {
    message: "washyizemo nimero itariyo,ongera uyishyiremo neza #*) Ahabanza",
    action: "FC",
  };

  public static entryAmountResponse = {
    message: "{name} , Shyiramo amafaranga #0) Subira inyuma #*) Ahabanza",
    action: "FC",
  };

  public static entryAmountResponseScreen = {
    message: "Shyiramo amafaranga #0) Subira inyuma  #*) Ahabanza",
    action: "FC",
  };
  
  public static wrongInputResponseScreen = {
    message: "mwarengeje inshuro mwemerewe gushyiramo",
    action: "FB",
  };

  public static wrongChoiceResponseScreen = {
    message: "Ibyo mwahisemo sibyo mwongere mukanya",
    action: "FB",
  };

  public static electrityConfirmResponseScreen(meterNumber: any, amount: any) {
    let response = {
      message: `WINJIJE Numero ya cash power : ${meterNumber} amafaranga ${amount} kanda #1) kwemeza #0) gusubira inyuma`,
      action: "FC",
    };
    return response;
  }
  public static electrityFinalResponseScreen(token: any) {
    let response = {
      message: `token yawe ni ${token}  ,kanda 797*3*2# wongere uyirebe`,
      action: "FC",
    };
    return response;
  }
  public static startimesPurchaseConfirmResponseScreen(
    cardNumber: any,
    amount: any,
  ) {
    let response = {
      message: `WINJIJE Numero ya startimes : ${cardNumber} amafaranga ${amount} kanda #1) kwemeza #0) gusubira inyuma`,
      action: "FC",
    };
    return response;
  }
  public static entryAmountForElectricityResponse(names: any) {
    let response = {
      message: `${names} Shyiramo amafaranga kanda #0) Subira inyuma #*) Ahabanza`,
      action: "FC",
    };
    return response;
  }
  public static startimesFinalResponseScreen = {
    message: `Murakoze,Mukanya arabageraho.FB`,
    action: "FB",
  };
}
