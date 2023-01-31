import { Inject, Injectable, Logger } from "@nestjs/common";
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 * 20, checkperiod: 5 });
import { Session } from "@nestjs/common";
import { UssdRequest } from "../entities/ussd.request.entity";
import { ValidatorHelper } from "../helper/validator.helper";
import { MainMenuResponse, ResponseDto } from "../response/response.dto";

@Injectable()
export class UssdService {
  constructor(private validatorHelper: ValidatorHelper) {}
  private readonly logger = new Logger(UssdService.name);
  async handlerMenus(query: any) {
    const input = {
      sessionId: query.sessionId,
      text: query.text,
      phoneNumber: query.phoneNumber,
      serviceCode: 797,
      newRequest: query.newRequest,
    };

    let nextMenu = "";
    let ussdRequestData = new UssdRequest();
    let meterNumber = "";
    let amount = "";
    let response = new ResponseDto();
    let mainMenuResponse = new MainMenuResponse();
    let text = "";
    let sessionId = input.sessionId;
    let nextAction = myCache.get(`${sessionId}-nextAction`);

    if (input.text === "0") {
      text = UssdService.handleUssdTextBack(input);
    } else if (input.text === "*") {
      text = UssdService.handleUssdReturnHome(input);
    } else {
      text = UssdService.handleUssdText(input);
    }

    console.log("input : " + text);
    console.log("next action : " + nextAction);

    if (text === "" && input.newRequest === "1") {
      return mainMenuResponse;
    } else if (text === "1") {
      response.message = `CON shyiramo numero ya cash power #0).gusubira inyuma`;
      response.action = "FC";
      UssdService.handleUssdNextSteps(input.sessionId, "1*1");
    } else if (text === "2") {
      response.message = `hitamo 1.Mtn #2.Airtel #0).gusubira inyuma `;
      response.action = "FC";
    } else if (text === "2*1") {
      response.message = `CON shyiramo numero ya Mtn #0).gusubira inyuma`;
      response.action = "FC";
      UssdService.handleUssdNextSteps(input.sessionId, "2*1*1");
    } else if (text === "2*2") {
      response.message = `CON shyiramo numero ya airtel cyangwa tigo #0).gusubira inyuma`;
      response.action = "FC";
      UssdService.handleUssdNextSteps(input.sessionId, "2*2*1");
    }

    //buy startimes subscription logics
    else if (text === "3") {
      response.message = `Shyiramo nimero y'ifatabuguzi #0).gusubira inyuma`;
      response.action = "FC";
      UssdService.handleUssdNextSteps(input.sessionId, "3*1");
    } else if (nextAction === "3*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleUssdReturnHome(input);
        return mainMenuResponse;
      }
      let status = this.validatorHelper.validateStartimeNumber(input.text);
      if (!status) {
        UssdService.handleUssdReturnHome(input);
        response.message = `washyizemo nimero itariyo,ongera uyishyiremo neza`;
        response.action = "FB";
        return response;
      }

      response.message = `CON shyiramo amafaranga #0).gusubira inyuma`;
      response.action = "FC";
      UssdService.handleUssdNextSteps(input.sessionId, "3*1*1");
    } else if (nextAction === "3*1*1") {
      if (input.text == 0) {
        //return home if input is 0
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return mainMenuResponse;
      }
      let cardNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        response.message = `amafaranga yemewe ni 100-250000 ongera ushyiremo amafaranga #0)gusubira inyuma`;
        response.action = "FC";
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return response;
      }
      let data = {
        cardNumber: cardNumber[1],
        amountPaid: amount,
      };
      try {
        //save in database
        ussdRequestData.sessionId = input.sessionId;
        ussdRequestData.text = text;
        ussdRequestData.phoneNumber = input.phoneNumber;
        ussdRequestData.data = JSON.stringify(data);
        ussdRequestData.save();
      } catch (error) {
        this.logger.log(error);
      }
      response.message = `CON Murakoze muguze ifatabuguzi rya startimes kuri ${cardNumber[1]} : namafaranga ${amount}`;
      response.action = "FB";
      myCache.del(`${sessionId}-meterNumber`);
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "1");
      UssdService.handleUssdReturnHome(input);
    }
    //end buying startimes subscription logics

    // handling receiving meter number
    else if (nextAction === "1*1") {
      let status = this.validatorHelper.validateMeterNunber(input.text);
      if (!status) {
        text = UssdService.handleUssdReturnHome(input);
        response.message = `nimero siyo,ongera uyishyiremo neza`;
        response.action = "FB";
        return response;
      }
      response.message = `CON shyiramo amafaranga`;
      response.action = "FC";
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "1*1*1");
    }
    // handling receiving amount
    else if (nextAction === "1*1*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleUssdReturnHome(input);
        return mainMenuResponse;
      }
      let cashPowerNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        response.message = `amafaranga yemewe ni 100-250000 ongera ushyiremo amafaranga #0)gusubira inyuma`;
        response.action = "FC";
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return response;
      }

      response.message = `CON Murakoze muguze umuriro kuri cash power ${cashPowerNumber[1]} : uhwanye namafaranga ${amount}`;
      response.action = "FB";
      myCache.del(`${sessionId}-meterNumber`);
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "1");
      UssdService.handleUssdReturnHome(input);
    }
    //handling phone number
    else if (nextAction === "2*1*1") {
      let status = this.validatorHelper.validateMtnPhoneNumber(input.text);
      if (!status) {
        text = UssdService.handleUssdReturnHome(input);
        response.message = `washyizemo nimero itariyo ongera ushyiremo neza`;
        response.action = "FB";
        return response;
      }
      response.message = `CON shyiramo amafaranga #0) gusubira inyuma`;
      response.action = "FC";
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "2*1*1*1");
    } else if (nextAction === "2*1*1*1") {
      if (input.text == 0) {
        //return home if input is 0
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return mainMenuResponse;
      }
      let phoneNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        response.message = `amafaranga yemewe ni 100-250000 ongera ushyiremo amafaranga #0)gusubira inyuma`;
        response.action = "FC";
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return response;
      }
      text = UssdService.handleUssdReturnHome(input);
      response.message = `CON Murakoze muguze ama inite kuri numero ${phoneNumber[2]} : ahwanye namafaranga ${amount}`;
      response.action = "FB";
    } //handling phone number
    else if (nextAction === "2*2*1") {
      let status = this.validatorHelper.validateAirtelPhoneNumber(input.text);
      if (!status) {
        text = UssdService.handleUssdReturnHome(input);
        response.message = `washyizemo nimero itariyo ongera ushyiremo neza`;
        response.action = "FB";
        return response;
      }
      response.message = `CON shyiramo amafaranga`;
      response.action = "FC";
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "2*2*1*1");
    } else if (nextAction === "2*2*1*1") {
      let phoneNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        response.message = `amafaranga yemewe ni 100-250000 ongera ushyiremo amafaranga #0)gusubira inyuma`;
        response.action = "FC";
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return response;
      }
      text = UssdService.handleUssdReturnHome(input);
      response.message = `CON Murakoze muguze ama inite kuri numero ${phoneNumber[2]} : ahwanye namafaranga ${amount}`;
      response.action = "FB";
    } else {
      response.message = `invalid option`;
      response.action = "FB";
    }
    return response;
  }

  private static handleUssdText(req: any) {
    // check if a user has provided a text, if not return immediately,
    if (req.text.length === 0) return req.text;

    // check if there is a pre-saved text, if not, save the new text and return it immediately.
    const userData = myCache.get(req.sessionId);
    if (userData === undefined) {
      myCache.set(req.sessionId, req);
      return req.text;
    }

    // if there is a pre-saved text then chain it with the new text of the user
    const prevText = userData.text;
    const nextText = prevText ? `${prevText}*${req.text}` : req.text;
    userData.text = nextText;

    // save the chained text and return the chained text
    myCache.set(req.sessionId, userData);
    return nextText;
  }

  //handle ussd backward chain
  private static handleUssdTextBack(req: any) {
    const userData = myCache.get(req.sessionId);

    const currentText = userData.text;
    const backText = currentText.substring(0, currentText.length - 2);
    userData.text = backText;

    myCache.set(req.sessionId, userData);
    return backText;
  }

  //handle ussd return back to home
  private static handleUssdReturnHome(req: any) {
    const userData = myCache.get(req.sessionId);

    const text = "";
    userData.text = text;
    myCache.set(req.sessionId, userData);
    return text;
  }

  //handle ussd next user action
  private static handleUssdNextSteps(sessionId: string, step: any) {
    let steps = step;
    // save the chained text and return the chained text
    myCache.set(`${sessionId}-nextAction`, steps);
    return steps;
  }
}
