import { Inject, Injectable, Logger, Res } from "@nestjs/common";
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 * 20, checkperiod: 5 });
import { Session } from "@nestjs/common";
import e from "express";
import { lastValueFrom } from "rxjs";
import { UssdAirtimeRequest } from "../entities/ussd.airtime.request.entity";
import { UssdElectricityRequest } from "../entities/ussd.power.request.entity";
import { UssdStartimesRequest } from "../entities/ussd.startimes.request.entity";
import { ValidatorHelper } from "../helper/validator.helper";
import { ResponseDto } from "../response/response.dto";

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
    let meterNumber = "";
    let amount = "";
    // const response = new ResponseDto();

    let text = "";
    let sessionId = input.sessionId;
    let nextAction = myCache.get(`${sessionId}-nextAction`);
    const counter = myCache.get(`${sessionId}-counter`);

    if (counter == 2) {
      UssdService.handleUssdReturnHome(input);
      UssdService.handleUssdNextSteps(input.sessionId, "1");
      myCache.del(`${sessionId}-counter`);
      myCache.del(`${sessionId}-name`);
      myCache.del(`${sessionId}-nextAction`);
      return ResponseDto.wrongInputResponseScreen;
    }
    if (input.text === "*") {
      UssdService.handleUssdReturnHome(input);
      myCache.del(`${sessionId}-counter`);
      myCache.del(`${sessionId}-name`);
      myCache.del(`${sessionId}-nextAction`);
      UssdService.handleUssdNextSteps(input.sessionId, "1");
      return ResponseDto.mainMenuResponse;
    } else {
      text = UssdService.handleUssdText(input);
    }

    console.log("input : " + text);
    console.log("next action : " + nextAction);

    if (text === "" && input.newRequest === "1") {
      return ResponseDto.mainMenuResponse;
    } else if (text === "1") {
      /*
    .
    .
    .
    //#region
    //start of business logic for buying electricity
    .
    .
    */
      UssdService.handleUssdNextSteps(input.sessionId, "1*1");
      return ResponseDto.entryCachPowerNumberResponseScreen;
    } // handling receiving meter number
    else if (nextAction === "1*1") {
      if (input.text == 0) {
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.mainMenuResponse;
      }
      let status = this.validatorHelper.validateMeterNunber(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.failedCachPowerNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      let isMeterNumberExist = this.validatorHelper.meterNumberNotFound(
        input.text,
      );
      if (!isMeterNumberExist) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.failedCachPowerNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      //fetch user names
      let userName = "JHON DOE";
      //save that name for getting when user come back
      myCache.set(`${sessionId}-name`, userName);
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "1*1*1");
      return ResponseDto.entryAmountForElectricityResponse(userName);
    }
    // handling receiving amount
    else if (nextAction === "1*1*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryCachPowerNumberResponseScreen;
      }
      let cashPowerNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidAmountResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      nextMenu = UssdService.handleUssdNextSteps(input.sessionId, "1*1*1*1");
      return ResponseDto.electrityConfirmResponseScreen(
        cashPowerNumber[1],
        amount,
      );
    } else if (nextAction == "100*1") {
      if (input.text != "*") {
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        UssdService.handleUssdReturnHome(input);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        return ResponseDto.mainMenuResponse;
      }
    } else if (nextAction === "1*1*1*1") {
      if (input.text == 0) {
        //get user name for display
        const userName = myCache.get(`${sessionId}-name`);
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryAmountForElectricityResponse(userName);
      } else if (input.text == 1) {
        let data = text.split("*");
        //cashpower number data[1]
        //amount for buying electricity  data[2]

        const token = "3338-8949-3828-2234";
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        let ussdRequest = new UssdElectricityRequest();
        ussdRequest.sessionId = input.sessionId;
        ussdRequest.text = text;
        ussdRequest.phoneNumber = input.phoneNumber;
        ussdRequest.cashPower = data[1];
        ussdRequest.token = token;
        // save data in db
        try {
          ussdRequest.save();
        } catch (err) {
          this.logger.log(err);
        }
        ussdRequest.amount = data[2];
        return ResponseDto.electrityFinalResponseScreen(token);
      } else {
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        return ResponseDto.wrongChoiceResponseScreen;
      }

      /*
    .
    .
    . 
    .end business logic for buying electricity
    .#endregion
    .
    .
    .
    */
      // ============================================================================================
      /*
    .
    .
    .starting of mtn airtime bussiness logic
    .
    .
    .
    */
    } else if (text === "2") {
      UssdService.handleUssdNextSteps(input.sessionId, "2*1");
      return ResponseDto.chooseCellProviderResponseScreen;
    } else if (text === "2*2") {
      if (input.text == 0) {
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.mainMenuResponse;
      }
      UssdService.handleUssdNextSteps(input.sessionId, "2*2");
      nextAction = myCache.get(`${sessionId}-nextAction`);
      UssdService.handleUssdNextSteps(input.sessionId, "2*2*1");
      return ResponseDto.entryPhoneNumberResponseScreen;
    } else if (nextAction === "2*1") {
      if (input.text == 0) {
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.mainMenuResponse;
      }
      UssdService.handleUssdNextSteps(input.sessionId, "2*1*1");
      return ResponseDto.entryPhoneNumberResponseScreen;
    } //handling phone number
    else if (nextAction === "2*1*1") {
      if (input.text == 0) {
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.chooseCellProviderResponseScreen;
      }
      let status = this.validatorHelper.validateMtnPhoneNumber(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidPhoneNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      const isPhoneExist = this.validatorHelper.phoneNumberNotFound(input.text);
      if (!isPhoneExist) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidPhoneNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "2*1*1*1");
      return ResponseDto.entryAmountResponseScreen;
    } else if (nextAction === "2*1*1*1") {
      if (input.text == 0) {
        //return home if input is 0
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryPhoneNumberResponseScreen;
      }
      let phoneNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidAmountResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "2*1*1*1*1");
      return ResponseDto.airtimePurchaseConfirmResponseScreen(
        phoneNumber[2],
        amount,
      );
    } else if (nextAction === "2*1*1*1*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryAmountResponseScreen;
      } else if (input.text == 1) {
        let data = text.split("*");
        //phone number data[2]
        //amount for airtime data[3]

        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        let ussdRequest = new UssdAirtimeRequest();
        ussdRequest.sessionId = input.sessionId;
        ussdRequest.text = text;
        ussdRequest.amount = data[3];
        ussdRequest.requestPhoneNumber = input.phoneNumber;
        ussdRequest.receiverPhoneNumber = data[2];
        // save data in db
        try {
          ussdRequest.save();
        } catch (err) {
          this.logger.log(err);
        }
        return ResponseDto.startimesAndAirtimeFinalResponseScreen;
      } else {
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        return ResponseDto.wrongChoiceResponseScreen;
      }
      /*
    .
    .
    .ending of mtn airtime bussiness logic
    .
      // ============================================================================================
    /*
    .
    .
    .starting of airtel airtime bussiness logic
    .
    .
    .
    */
    } else if (nextAction === "2*2") {
      UssdService.handleUssdReturnHome(input);
      myCache.del(`${sessionId}-counter`);
      myCache.del(`${sessionId}-name`);
      myCache.del(`${sessionId}-nextAction`);
      UssdService.handleUssdNextSteps(input.sessionId, "1");
      return ResponseDto.mainMenuResponse;
    } //handling phone number
    else if (nextAction === "2*2*1") {
      if (input.text == 0) {
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.chooseCellProviderResponseScreen;
      }
      let status = this.validatorHelper.validateAirtelPhoneNumber(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidPhoneNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      const isPhoneExist = this.validatorHelper.phoneNumberNotFound(input.text);
      if (!isPhoneExist) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidPhoneNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "2*2*1*1");
      return ResponseDto.entryAmountResponseScreen;
    } else if (nextAction === "2*2*1*1") {
      if (input.text == 0) {
        //return home if input is 0
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryPhoneNumberResponseScreen;
      }
      let phoneNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidAmountResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "2*2*1*1*1");
      return ResponseDto.airtimePurchaseConfirmResponseScreen(
        phoneNumber[2],
        amount,
      );
    } else if (nextAction === "2*2*1*1*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryAmountResponseScreen;
      } else if (input.text == 1) {
        let data = text.split("*");
        //phone number data[2]
        //amount for airtime data[3]

        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        let ussdRequest = new UssdAirtimeRequest();
        ussdRequest.sessionId = input.sessionId;
        ussdRequest.text = text;
        ussdRequest.amount = data[3];
        ussdRequest.requestPhoneNumber = input.phoneNumber;
        ussdRequest.receiverPhoneNumber = data[2];
        // save data in db
        try {
          ussdRequest.save();
        } catch (err) {
          this.logger.log(err);
        }
        return ResponseDto.startimesAndAirtimeFinalResponseScreen;
      } else {
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        return ResponseDto.wrongChoiceResponseScreen;
      }

      //----------------------------------------------------------------
    } else if (text === "3") {
      /*
    .
    .
    .ending of airtel airtime bussiness logic
    .
    .
    .
    .
    */
      /*
    .
    .
    .start of buying startimes subscription logics
    .
    .
    */
      UssdService.handleUssdNextSteps(input.sessionId, "3*1");
      return ResponseDto.entryStartimesNumberResponseScreen;
    } else if (nextAction === "3*1") {
      if (input.text == 0) {
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.mainMenuResponse;
      }
      let status = this.validatorHelper.validateStartimeNumber(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.failedCachPowerNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      let isCardNumberExist = this.validatorHelper.cardNumberNotFound(
        input.text,
      );
      if (!isCardNumberExist) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.failedCachPowerNumberResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "3*1*1");
      return ResponseDto.entryAmountResponseScreen;
    } else if (nextAction === "3*1*1") {
      if (input.text == 0) {
        //return back if input is 0
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryStartimesNumberResponseScreen;
      }
      //if user reached on this step we can clear the caching counter
      //that count how many times user failed to provide correct card number
      myCache.del(`${sessionId}-counter`);
      let cardNumber = text.split("*");
      amount = input.text;

      let status = this.validatorHelper.validateAmount(input.text);
      if (!status) {
        UssdService.handleBackWardActionOnce(input);
        UssdService.countFailedInputs(input);
        return ResponseDto.invalidAmountResponseScreen;
      }
      myCache.del(`${sessionId}-counter`);
      UssdService.handleUssdNextSteps(input.sessionId, "3*1*1*1");
      return ResponseDto.startimesPurchaseConfirmResponseScreen(
        cardNumber[1],
        amount,
      );
    } else if (nextAction === "3*1*1*1") {
      if (input.text == 0) {
        //get user name for display
        const userName = myCache.get(`${sessionId}-name`);
        //back home
        UssdService.handleBackWardSteps(input, nextAction);
        return ResponseDto.entryAmountResponseScreen;
      } else if (input.text == 1) {
        let data = text.split("*");
        //startimes card number data[1]
        //amount for buying buying subscription  data[2]

        const token = "3338-8949-3828-2234";
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        let ussdRequest = new UssdStartimesRequest();
        ussdRequest.sessionId = input.sessionId;
        ussdRequest.text = text;
        ussdRequest.phoneNumber = input.phoneNumber;
        ussdRequest.cardNumber = data[1];
        ussdRequest.amount = data[2];
        ussdRequest.token = token;
        // save data in db
        try {
          ussdRequest.save();
        } catch (err) {
          this.logger.log(err);
        }
        ussdRequest.amount = data[2];
        return ResponseDto.startimesAndAirtimeFinalResponseScreen;
      } else {
        myCache.del(`${sessionId}-counter`);
        myCache.del(`${sessionId}-name`);
        myCache.del(`${sessionId}-nextAction`);
        UssdService.handleUssdNextSteps(input.sessionId, "1");
        UssdService.handleUssdReturnHome(input);
        return ResponseDto.wrongChoiceResponseScreen;
      }

      /*
    .
    .
    . 
    .end business logic for buying electricity
    .#endregion
    .
    .
    .
    */
    }
    //end buying startimes subscription logics
    else {
      const response = {
        message: `invalid option`,
        action: "FB",
      };
      myCache.del(`${sessionId}-counter`);
      myCache.del(`${sessionId}-name`);
      myCache.del(`${sessionId}-nextAction`);
      UssdService.handleUssdReturnHome(input);
      UssdService.handleUssdNextSteps(input.sessionId, "1");
      return response;
    }
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

  //handle ussd next user action
  private static handleBackWardSteps(req: any, nextAcion: any) {
    console.log("===========================================");
    //get user info
    const userData = myCache.get(req.sessionId);

    console.log("current text v1 : " + userData.text);
    console.log("current next action v1 : " + nextAcion);

    //convert text into array
    let newText = userData.text.split("*");
    //remove last index
    newText.pop();
    newText.pop();
    userData.text = newText.join("*");
    //set new text backward
    myCache.set(req.sessionId, userData);

    //handle next action step back ward
    let action = nextAcion.split("*");
    action.pop();
    let newActionStep = action.join("*");
    let sessionId = req.sessionId;
    //set new next action backward
    myCache.set(`${sessionId}-nextAction`, newActionStep);

    const userNewData = myCache.get(req.sessionId);
    const nextNewAction = myCache.get(`${sessionId}-nextAction`);
    console.log("===========================================");

    console.log(
      "after handling backward current text v1 : " + userNewData.text,
    );
    console.log(
      "after handling backward current next action v1 : " + nextNewAction,
    );
  }
  //handle ussd next user action
  private static handleBackWardAction(req: any) {
    //get user info
    const userData = myCache.get(req.sessionId);

    //convert text into array
    let texts = userData.text.split("*");
    //remove last index
    texts.pop();
    texts.pop();
    userData.text = texts.join("*");
    //set new text backward
    myCache.set(req.sessionId, userData);
    const userNewData = myCache.get(req.sessionId);
  }

  //handle ussd next user action
  private static handleBackWardActionOnce(req: any) {
    //get user info
    const userData = myCache.get(req.sessionId);

    //convert text into array
    let texts = userData.text.split("*");
    //remove last index
    texts.pop();
    userData.text = texts.join("*");
    //set new text backward
    myCache.set(req.sessionId, userData);
    const userNewData = myCache.get(req.sessionId);
  }

  //count and handle failed meter number or startimes card number failed
  public static countFailedInputs(req: any) {
    //get user info
    let sessionId = req.sessionId;
    const increment = 1;
    const currentValue = myCache.get(`${sessionId}-counter`);
    if (currentValue == undefined) {
      myCache.set(`${sessionId}-counter`, increment);
    } else {
      const newValue = currentValue + increment;
      myCache.set(`${sessionId}-counter`, newValue);
    }
  }
}
