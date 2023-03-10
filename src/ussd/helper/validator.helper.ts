import { ForbiddenException, Injectable } from "@nestjs/common";
import { In, Not } from "typeorm";
import { ResponseDto } from "../response/response.dto";

@Injectable()
export class ValidatorHelper {
  //validate meter number
  validateMeterNunber(meterNumber: string) {
    const regex = /^[1-9]\d*(\.\d+)?$/;
    if (meterNumber == "") {
      return false;
    }
    return true;
  }

  //validate startimes number
  validateStartimeNumber(input: string) {
    const regex = /^[1-9]\d*(\.\d+)?$/;
    if (input == "") {
      return false;
    }
    return true;
  }

  //validate mtn phone number
  validateMtnPhoneNumber(phoneNumber: string) {
    const pattern = /07[9,8]{1}[0-9]{7}/;
    if (
      phoneNumber == "" ||
      !pattern.test(phoneNumber) ||
      phoneNumber.length != 10
    ) {
      return false;
    }
    return true;
  }

  //validate mtn phone number
  validateAirtelPhoneNumber(phoneNumber: string) {
    const pattern = /07[2,3]{1}[0-9]{7}/;
    if (
      phoneNumber == "" ||
      !pattern.test(phoneNumber) ||
      phoneNumber.length != 10
    ) {
      return false;
    }
    return true;
  }
  //validate mtn phone number
  validateAmount(amount: any) {
    const regex = /^[1-9]\d*(\.\d+)?$/;
    if (
      amount == "" ||
      parseInt(amount) < 100 ||
      parseInt(amount) > 250000 ||
      !regex.test(amount) ||
      amount % 1 !== 0
    ) {
      return false;
    }
    return true;
  }
}
