import { Injectable } from "@nestjs/common";
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 * 20, checkperiod: 5 });
import { Session } from "@nestjs/common";

@Injectable()
export class UssdService {
  constructor() {}
  async handlerMenus(input: any) {
    let nextMenu = "";
    let meterNumber = "";
    let amount = "";
    let response = {
      message: "",
      action: "",
    };
    let data: {};
    // const { sessionId, serviceCode, phoneNumber, text } = query;

    let text = "";

    let nextAction = myCache.get("step");

    if (input.text === "0") {
      text = UssdService.handleUssdTextBack(input);
    } else if (input.text === "*") {
      text = UssdService.handleUssdReturnHome(input);
    } else {
      text = UssdService.handleUssdText(input);
    }

    console.log("input : " + text);

    if (text === "") {
      // This is the first request. Show the main menu
      response.message = `CON Welcome to USSD Service: #1.Kugura umuriro #2.Kugura airtime #3.Kugura Startimes`;
      response.action = "FC";

      nextMenu = UssdService.handleUssdNextSteps("1");

      console.log("next step : " + nextMenu);
    } else if (text === "1") {
      response.message = `CON shyiramo numero ya cash power`;
      response.action = "FC";
      nextMenu = UssdService.handleUssdNextSteps("1*1");
    } else if (text === "2") {
      response.message = `hitamo 1.Mtn #2.Airtel #3.Tigo # 0.gusubira inyuma `;
      response.action = "FC";
    } else if (text === "2*1") {
      response.message = `CON shyiramo numero ya Mtn`;
      response.action = "FC";
    } else if (text === "1*390") {
      response.message = `CON shyiramo numero decoder`;
      response.action = "FC";
    } else if (nextAction === "1*1") {
      meterNumber = input.text;
      if (meterNumber === "") {
        console.log("is empty meter number " + meterNumber)
        response.action = "FB";
        response.message = `nabwo mwashizemo numero ya cash power ongera mukanya`;
        nextMenu = UssdService.handleUssdNextSteps("");
        UssdService.handleUssdReturnHome(input);
      }
      myCache.set("meterNumber", meterNumber);
      response.action = "FC";
      response.message = `CON shyiramo amafaranga`;
      nextMenu = UssdService.handleUssdNextSteps("1*1*1");
    } else if (nextAction === "1*1*1") {
      amount = input.text;
      if (amount === "") {
        console.log("is empty amount " + amount)
        response.action = "FB";
        response.message = `nabwo mwashizemo amafaranga ongera mukanya`;
        nextMenu = UssdService.handleUssdNextSteps("1");
        UssdService.handleUssdReturnHome(input);
      }
      if (parseInt(amount) < 100 || parseInt(amount) > 250000) {
        if (parseInt(amount) < 100) {
          response.action = "FB";
          response.message = `washizemo amafaranga macye ongera mukanya`;
        } else {
          response.action = "FB";
          response.message = `washizemo amafaranga menshi ongera mukanya`;
        }
        myCache.del("meterNumber");
        nextMenu = UssdService.handleUssdNextSteps("1");
        UssdService.handleUssdReturnHome(input);
        return response;
      }
      response.action = "FB";
      let meterNum = myCache.get("meterNumber");
      response.message = `CON Murakoze muguze umuriro kuri cash power ${meterNum} : uhwanye namafaranga ${amount}`;
      myCache.del("meterNumber");
      nextMenu = UssdService.handleUssdNextSteps("1");
      UssdService.handleUssdReturnHome(input);
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
  private static handleUssdNextSteps(step: any) {
    let steps = step;
    // save the chained text and return the chained text
    myCache.set("step", steps);
    return steps;
  }
}
